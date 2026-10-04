"use client";

// 선택한 클립의 구간·문구·화면·자막·효과음을 고치는 곳.
import { Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { activeSubtitle } from "@/lib/studio/render";
import { clipDuration, clipSegments, segmentOffsets, segmentsPatch } from "@/lib/studio/segments";
import { sfxLabel, sfxList } from "@/lib/studio/sfx";
import { cuesForSegments, formatTime, newId, round } from "@/lib/studio/subtitles";
import type { Cue } from "@/lib/studio/subtitles";
import type { Template } from "@/lib/studio/templates";
import type { Clip, Segment, SfxCue, Subtitle } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

import { Button, inputClass, Section, Slider } from "./ui";
import type { Player } from "./use-player";

type Props = {
  clip: Clip;
  template: Template;
  /** 화면 설정(확대·위치·아래 자르기·자막 위치)을 모든 클립에 똑같이 적용 */
  onApplyAll: (patch: Pick<Clip, "zoom" | "focusX" | "cropBottom" | "subtitleY">) => void;
  sourceDuration: number;
  cues: Cue[];
  player: Player;
  onChange: (patch: Partial<Clip>) => void;
};

const timeInputClass =
  "w-[64px] rounded-[6px] border border-white/15 bg-black/40 px-1.5 py-1 text-right text-[12px] tabular-nums text-white outline-none focus-visible:border-coral";

function TimeInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      type="number"
      step={0.1}
      min={0}
      value={round(value)}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (Number.isFinite(v)) onChange(v);
      }}
      className={timeInputClass}
      aria-label={label}
    />
  );
}

/** "분:초" 또는 초로 적는 시각 칸. 칸을 벗어나거나 Enter를 누르면 반영된다. */
function ClockInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  function commit(text: string) {
    const parts = text.trim().replace(",", ".").split(":").map(Number);
    if (!parts.length || parts.some((n) => !Number.isFinite(n))) return;
    onChange(parts.reduce((total, part) => total * 60 + part, 0));
  }
  return (
    <input
      key={value}
      defaultValue={formatTime(value, true)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit(e.currentTarget.value);
      }}
      className="w-[72px] rounded-[6px] border border-white/15 bg-black/40 px-1.5 py-1 text-center text-[12px] tabular-nums text-white outline-none focus-visible:border-coral"
      aria-label={label}
    />
  );
}

export function ClipEditor({ clip, template, onApplyAll, sourceDuration, cues, player, onChange }: Props) {
  const length = clipDuration(clip);
  const segments = clipSegments(clip);
  const offsets = segmentOffsets(segments);
  const [selectedSeg, setSelectedSeg] = useState(0);
  const activeSeg = Math.min(selectedSeg, segments.length - 1);

  /** 컷 목록을 바꾸고, 자막 파일이 있으면 자막도 새 컷에 맞춰 다시 가져온다. */
  function setSegments(next: Segment[]) {
    const cleaned = next.map((seg) => {
      const start = round(Math.max(0, Math.min(seg.start, sourceDuration - 0.5)));
      const end = round(Math.max(start + 0.5, Math.min(seg.end, sourceDuration)));
      return { start, end };
    });
    onChange({ ...segmentsPatch(cleaned), ...(cues.length ? { subtitles: cuesForSegments(cues, cleaned) } : {}) });
  }

  function updateSegment(index: number, patch: Partial<Segment>) {
    setSegments(segments.map((seg, i) => (i === index ? { ...seg, ...patch } : seg)));
  }

  // ── 자막 ──
  function updateSubtitle(id: string, patch: Partial<Subtitle>) {
    onChange({ subtitles: clip.subtitles.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  const activeSubtitleId = activeSubtitle(clip.subtitles, player.rel)?.id;

  // ── 효과음 ──
  function addSfx(kind: SfxCue["kind"]) {
    const at = round(Math.max(0, Math.min(length - 0.2, player.rel)));
    player.previewSfx(kind);
    onChange({ sfx: [...clip.sfx, { id: newId(), at, kind }].sort((a, b) => a.at - b.at) });
  }

  return (
    <div>
      <Section
        title={segments.length > 1 ? `구간 · 컷 ${segments.length}개 이어붙이기` : "구간"}
        hint={`총 ${round(length)}초. 컷을 여러 개 넣으면 위에서부터 차례로 이어붙여요. 시각은 0:36 처럼 적어요.`}
      >
        <ul className="grid gap-1.5">
          {segments.map((seg, i) => (
            <li
              key={i}
              onClick={() => setSelectedSeg(i)}
              className={cn(
                "flex items-center gap-1.5 rounded-[8px] border px-2 py-1.5 text-[12px] text-white/70",
                i === activeSeg ? "border-coral/60 bg-coral/10" : "border-white/10",
              )}
            >
              <span className="w-9 shrink-0 font-bold text-white">컷 {i + 1}</span>
              <ClockInput value={seg.start} onChange={(v) => updateSegment(i, { start: v })} label={`컷 ${i + 1} 시작`} />
              <span>~</span>
              <ClockInput value={seg.end} onChange={(v) => updateSegment(i, { end: v })} label={`컷 ${i + 1} 끝`} />
              <span className="w-10 text-right tabular-nums text-white/40">{round(seg.end - seg.start)}초</span>
              <button
                type="button"
                onClick={() => player.seekRel(offsets[i])}
                className="ml-auto grid size-7 place-items-center rounded-[6px] text-white/60 hover:text-coral"
                aria-label={`컷 ${i + 1} 처음으로 이동`}
              >
                <Play className="size-3.5" />
              </button>
              {segments.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSegments(segments.filter((_, k) => k !== i))}
                  className="grid size-7 place-items-center rounded-[6px] text-white/40 hover:text-[#ff8a77]"
                  aria-label={`컷 ${i + 1} 지우기`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Button size="sm" onClick={() => updateSegment(activeSeg, { start: player.sourceTime })}>
            지금 위치를 컷 {activeSeg + 1} 시작으로
          </Button>
          <Button size="sm" onClick={() => updateSegment(activeSeg, { end: player.sourceTime })}>
            지금 위치를 컷 {activeSeg + 1} 끝으로
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSegments([...segments, { start: player.sourceTime, end: player.sourceTime + 5 }]);
              setSelectedSeg(segments.length);
            }}
          >
            <Plus className="size-3.5" />컷 추가
          </Button>
        </div>
      </Section>

      <Section title="헤드 · 바닥 문구" hint="*별표*로 감싼 글자는 강조 색으로 나와요. 줄바꿈도 그대로 나와요.">
        <label className="block text-[13px] text-white/70">
          헤드 문구 (위)
          <textarea
            rows={2}
            value={clip.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={"예) 이거 모르면\n*손해* 봅니다"}
            className={cn(inputClass, "mt-1 resize-none")}
          />
        </label>
        <label className="mt-3 block text-[13px] text-white/70">
          바닥 문구 (아래)
          <textarea
            rows={2}
            value={clip.bottom}
            onChange={(e) => onChange({ bottom: e.target.value })}
            placeholder="예) 풀영상은 프로필 링크에서"
            className={cn(inputClass, "mt-1 resize-none")}
          />
        </label>
      </Section>

      <Section
        title="화면"
        action={
          <Button
            size="sm"
            onClick={() =>
              onApplyAll({ zoom: clip.zoom, focusX: clip.focusX, cropBottom: clip.cropBottom, subtitleY: clip.subtitleY })
            }
            title="확대·보이는 위치·아래 자르기·자막 위치를 모든 클립에 똑같이 적용해요"
          >
            모든 클립에 적용
          </Button>
        }
      >
        <div className="grid gap-3">
          <Slider
            label="확대"
            value={clip.zoom}
            min={0.6}
            max={2.5}
            step={0.05}
            onChange={(zoom) => onChange({ zoom })}
            format={(v) =>
              template.videoFit === "width" ? `가로폭의 ${Math.round(v * template.videoZoom * 100)}%` : `${v.toFixed(2)}배`
            }
          />
          <Slider
            label="보이는 위치 (왼쪽 ↔ 오른쪽)"
            value={clip.focusX}
            min={0}
            max={1}
            step={0.01}
            onChange={(focusX) => onChange({ focusX })}
            format={(v) => (Math.abs(v - 0.5) < 0.02 ? "가운데" : v < 0.5 ? "왼쪽" : "오른쪽")}
          />
          <Slider
            label="아래 자르기 (영상에 박힌 자막 가리기)"
            value={clip.cropBottom ?? template.cropBottom ?? 0}
            min={0}
            max={0.4}
            step={0.01}
            onChange={(cropBottom) => onChange({ cropBottom })}
            format={(v) => (v < 0.005 ? "안 자름" : `${Math.round(v * 100)}%`)}
          />
          <Slider
            label="자막 위치 (위 ↔ 아래)"
            value={clip.subtitleY ?? 0}
            min={-700}
            max={500}
            step={5}
            onChange={(subtitleY) => onChange({ subtitleY })}
            format={(v) => (v === 0 ? "기본" : v < 0 ? `${-v}px 위로` : `${v}px 아래로`)}
          />
        </div>
      </Section>

      <Section
        title={`자막 (${clip.subtitles.length})`}
        hint="자막 파일(SRT)에서 클립 구간만큼 자동으로 들어가요. 틀린 글자나 시간만 아래에서 고치면 돼요."
      >
        <div className="flex flex-wrap gap-1.5">
          {cues.length > 0 && (
            <Button size="sm" onClick={() => onChange({ subtitles: cuesForSegments(cues, segments) })}>
              자막 파일에서 다시 가져오기
            </Button>
          )}
          {clip.subtitles.length > 0 && (
            <Button size="sm" tone="danger" onClick={() => onChange({ subtitles: [] })}>
              모두 지우기
            </Button>
          )}
        </div>
        {!clip.subtitles.length && !cues.length && (
          <p className="text-[12px] leading-5 text-white/40">자막 파일을 넣지 않아서 자막이 없어요. 처음 화면에서 SRT 파일을 함께 넣어 주세요.</p>
        )}

        {clip.subtitles.length > 0 && (
          <ul className="mt-3 grid gap-1.5">
            {clip.subtitles.map((s, i) => (
              <li
                key={s.id}
                className={cn(
                  "flex min-w-0 items-center gap-1.5 rounded-[8px] border px-1.5 py-1.5",
                  s.id === activeSubtitleId ? "border-coral/60 bg-coral/10" : "border-white/10",
                )}
              >
                <button
                  type="button"
                  onClick={() => player.seekRel(s.start)}
                  className="w-5 text-center text-[11px] text-white/40 hover:text-coral"
                  aria-label={`${i + 1}번 자막 위치로 이동`}
                >
                  {i + 1}
                </button>
                <TimeInput value={s.start} onChange={(v) => updateSubtitle(s.id, { start: v })} label={`${i + 1}번 자막 시작(초)`} />
                <TimeInput value={s.end} onChange={(v) => updateSubtitle(s.id, { end: v })} label={`${i + 1}번 자막 끝(초)`} />
                <input
                  value={s.text}
                  onChange={(e) => updateSubtitle(s.id, { text: e.target.value })}
                  className="w-0 min-w-0 flex-1 rounded-[6px] border border-transparent bg-transparent px-1.5 py-1 text-[13px] text-white outline-none focus-visible:border-coral"
                  aria-label={`${i + 1}번 자막 내용`}
                />
                <button
                  type="button"
                  onClick={() => onChange({ subtitles: clip.subtitles.filter((x) => x.id !== s.id) })}
                  className="grid size-7 place-items-center rounded-[6px] text-white/40 hover:text-[#ff8a77]"
                  aria-label={`${i + 1}번 자막 지우기`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`효과음 (${clip.sfx.length})`} hint="미리보기에서 원하는 위치로 옮긴 뒤 누르면 그 자리에 들어가요.">
        <div className="flex flex-wrap gap-1.5">
          {sfxList.map((s) => (
            <Button key={s.kind} size="sm" onClick={() => addSfx(s.kind)}>
              <Plus className="size-3.5" />
              {s.label}
            </Button>
          ))}
        </div>
        {clip.sfx.length > 0 && (
          <ul className="mt-3 grid gap-1.5">
            {clip.sfx.map((cue) => (
              <li key={cue.id} className="flex items-center gap-2 rounded-[8px] border border-white/10 px-2 py-1.5 text-[13px] text-white">
                <TimeInput
                  value={cue.at}
                  onChange={(v) => onChange({ sfx: clip.sfx.map((x) => (x.id === cue.id ? { ...x, at: Math.max(0, v) } : x)) })}
                  label={`${sfxLabel(cue.kind)} 효과음 위치(초)`}
                />
                <span className="flex-1">{sfxLabel(cue.kind)}</span>
                <button
                  type="button"
                  onClick={() => player.previewSfx(cue.kind)}
                  className="grid size-7 place-items-center rounded-[6px] text-white/60 hover:text-coral"
                  aria-label={`${sfxLabel(cue.kind)} 들어보기`}
                >
                  <Play className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ sfx: clip.sfx.filter((x) => x.id !== cue.id) })}
                  className="grid size-7 place-items-center rounded-[6px] text-white/40 hover:text-[#ff8a77]"
                  aria-label={`${sfxLabel(cue.kind)} 효과음 지우기`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
