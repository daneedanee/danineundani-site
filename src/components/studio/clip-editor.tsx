"use client";

// 선택한 클립의 구간·문구·화면·자막·효과음을 고치는 곳.
import { Minus, Play, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { sfxLabel, sfxList } from "@/lib/studio/sfx";
import { cuesForClip, distributeLines, formatTime, newId, round } from "@/lib/studio/subtitles";
import type { Cue } from "@/lib/studio/subtitles";
import type { Clip, SfxCue, Subtitle } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

import { Button, inputClass, Section, Slider } from "./ui";
import type { Player } from "./use-player";

type Props = {
  clip: Clip;
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

function Nudge({ onClick, children, label }: { onClick: () => void; children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-7 place-items-center rounded-[6px] border border-white/15 text-white/70 hover:bg-white/10"
    >
      {children}
    </button>
  );
}

export function ClipEditor({ clip, sourceDuration, cues, player, onChange }: Props) {
  const length = clip.end - clip.start;
  const [bulk, setBulk] = useState("");
  const [syncIndex, setSyncIndex] = useState<number | null>(null);
  const syncRef = useRef<{ subs: Subtitle[]; index: number } | null>(null);
  const relRef = useRef(player.rel);

  useEffect(() => {
    relRef.current = player.rel;
  }, [player.rel]);

  function setRange(start: number, end: number) {
    const s = Math.max(0, Math.min(start, sourceDuration - 1));
    const e = Math.max(s + 1, Math.min(end, sourceDuration));
    onChange({ start: round(s), end: round(e) });
  }

  // ── 자막 ──
  function updateSubtitle(id: string, patch: Partial<Subtitle>) {
    onChange({ subtitles: clip.subtitles.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function bulkLines() {
    const lines = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.length ? lines : clip.subtitles.map((s) => s.text);
  }

  function startSync() {
    const lines = bulkLines();
    if (!lines.length) return;
    const subs = lines.map((text) => ({ id: newId(), start: length, end: length, text }));
    syncRef.current = { subs, index: 0 };
    onChange({ subtitles: subs });
    setSyncIndex(0);
    player.play(0);
  }

  // 맞추는 중: 스페이스바를 누를 때마다 다음 자막이 시작된다. 마지막 자막 뒤에 한 번 더 누르면 마지막 자막이 끝난다.
  useEffect(() => {
    if (syncIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const state = syncRef.current;
      if (!state) return;
      const t = round(Math.max(0, relRef.current));
      const subs = [...state.subs];
      if (state.index > 0) subs[state.index - 1] = { ...subs[state.index - 1], end: t };
      if (state.index < subs.length) subs[state.index] = { ...subs[state.index], start: t, end: length };
      state.subs = subs;
      state.index += 1;
      onChange({ subtitles: subs });
      if (state.index > subs.length) {
        setSyncIndex(null);
        player.pause();
      } else setSyncIndex(state.index);
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [syncIndex, length, onChange, player]);

  // 맞추다가 재생이 끝나면 맞추기도 끝낸다.
  useEffect(() => {
    if (syncIndex !== null && !player.playing) {
      const id = setTimeout(() => setSyncIndex(null), 300);
      return () => clearTimeout(id);
    }
  }, [player.playing, syncIndex]);

  const activeSubtitle = clip.subtitles.find((s) => player.rel >= s.start && player.rel < s.end)?.id;

  // ── 효과음 ──
  function addSfx(kind: SfxCue["kind"]) {
    const at = round(Math.max(0, Math.min(length - 0.2, player.rel)));
    player.previewSfx(kind);
    onChange({ sfx: [...clip.sfx, { id: newId(), at, kind }].sort((a, b) => a.at - b.at) });
  }

  return (
    <div>
      <Section title="구간" hint={`길이 ${round(length)}초 · 원본 ${formatTime(clip.start, true)} ~ ${formatTime(clip.end, true)}`}>
        <div className="grid gap-2 text-[13px] text-white/70">
          {(
            [
              ["시작", clip.start, (v: number) => setRange(v, clip.end)],
              ["끝", clip.end, (v: number) => setRange(clip.start, v)],
            ] as const
          ).map(([label, value, set]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-8">{label}</span>
              <Nudge label={`${label} 1초 앞으로`} onClick={() => set(value - 1)}>
                <Minus className="size-3.5" />
              </Nudge>
              <TimeInput value={value} onChange={set} label={`${label} (초)`} />
              <Nudge label={`${label} 1초 뒤로`} onClick={() => set(value + 1)}>
                <Plus className="size-3.5" />
              </Nudge>
              <span className="ml-1 tabular-nums text-white/40">{formatTime(value, true)}</span>
            </div>
          ))}
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Button size="sm" onClick={() => setRange(player.sourceTime, clip.end)}>
              지금 위치를 시작으로
            </Button>
            <Button size="sm" onClick={() => setRange(clip.start, player.sourceTime)}>
              지금 위치를 끝으로
            </Button>
          </div>
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

      <Section title="화면">
        <div className="grid gap-3">
          <Slider label="확대" value={clip.zoom} min={1} max={2.5} step={0.05} onChange={(zoom) => onChange({ zoom })} format={(v) => `${v.toFixed(2)}배`} />
          <Slider
            label="보이는 위치 (왼쪽 ↔ 오른쪽)"
            value={clip.focusX}
            min={0}
            max={1}
            step={0.01}
            onChange={(focusX) => onChange({ focusX })}
            format={(v) => (Math.abs(v - 0.5) < 0.02 ? "가운데" : v < 0.5 ? "왼쪽" : "오른쪽")}
          />
        </div>
      </Section>

      <Section
        title={`자막 (${clip.subtitles.length})`}
        hint="한 줄에 자막 하나씩 붙여 넣고, 고르게 배치하거나 재생하면서 스페이스바로 넘기며 타이밍을 맞춰요."
      >
        <textarea
          rows={4}
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={"자막을 한 줄에 하나씩\n여기에 붙여 넣으세요"}
          className={cn(inputClass, "resize-y")}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Button size="sm" disabled={!bulkLines().length} onClick={() => onChange({ subtitles: distributeLines(bulkLines().join("\n"), length) })}>
            고르게 배치
          </Button>
          <Button size="sm" tone={syncIndex !== null ? "primary" : "ghost"} disabled={!bulkLines().length || syncIndex !== null} onClick={startSync}>
            {syncIndex !== null ? `스페이스바로 넘기는 중 (${Math.min(syncIndex, clip.subtitles.length)}/${clip.subtitles.length})` : "재생하며 맞추기"}
          </Button>
          {cues.length > 0 && (
            <Button size="sm" onClick={() => onChange({ subtitles: cuesForClip(cues, clip.start, clip.end) })}>
              자막 파일에서 가져오기
            </Button>
          )}
          {clip.subtitles.length > 0 && (
            <Button size="sm" tone="danger" onClick={() => onChange({ subtitles: [] })}>
              모두 지우기
            </Button>
          )}
        </div>
        {syncIndex !== null && (
          <p className="mt-2 rounded-[8px] bg-coral/15 px-3 py-2 text-[12px] leading-5 text-[#ffb3a6]">
            자막이 시작될 때마다 스페이스바를 누르세요. 마지막 자막이 끝날 때 한 번 더 누르면 끝나요.
          </p>
        )}

        {clip.subtitles.length > 0 && (
          <ul className="mt-3 grid gap-1.5">
            {clip.subtitles.map((s, i) => (
              <li
                key={s.id}
                className={cn(
                  "flex min-w-0 items-center gap-1.5 rounded-[8px] border px-1.5 py-1.5",
                  s.id === activeSubtitle ? "border-coral/60 bg-coral/10" : "border-white/10",
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
