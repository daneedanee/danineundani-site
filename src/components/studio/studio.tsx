"use client";

// 쇼츠 편집기 (/studio)
// 1) 롱폼 영상을 올린다 → 2) 소리로 "터지는 구간"을 자동으로 고른다
// → 3) 양식에 맞춰 헤드·바닥 문구, 자막, 효과음을 넣는다 → 4) 세로 영상 파일로 저장한다.
// 영상은 이 컴퓨터의 브라우저 안에서만 다룬다. 서버로 올라가지 않는다.
import { Download, FileVideo, Plus, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { analyzeAudio } from "@/lib/studio/audio-analysis";
import { exportClip, fileExtension, pickMimeType } from "@/lib/studio/export";
import { findHighlights } from "@/lib/studio/highlights";
import type { Highlight } from "@/lib/studio/highlights";
import type { FontFamilies } from "@/lib/studio/render";
import { cuesForClip, formatTime, newId, parseSubtitleFile, round } from "@/lib/studio/subtitles";
import type { Cue } from "@/lib/studio/subtitles";
import { findTemplate, templates } from "@/lib/studio/templates";
import type { Clip, Envelope } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

import { ClipEditor } from "./clip-editor";
import { Preview } from "./preview";
import { Timeline } from "./timeline";
import { Button } from "./ui";
import { usePlayer } from "./use-player";

type Phase = "upload" | "analyzing" | "edit";

type Saved = {
  clips: Clip[];
  templateId: string;
  envelope: { hop: number; duration: number; db: number[] };
};

const LENGTH_OPTIONS = [30, 45, 60];
const COUNT_OPTIONS = [3, 5, 8];

function storageKey(file: File) {
  return `studio:${file.name}:${file.size}`;
}

function loadSaved(file: File): Saved | null {
  try {
    const raw = localStorage.getItem(storageKey(file));
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function makeClip(h: Highlight, cues: Cue[]): Clip {
  return {
    id: newId(),
    start: round(h.start),
    end: round(h.end),
    score: h.score,
    peak: h.peak,
    title: "",
    bottom: "",
    zoom: 1,
    focusX: 0.5,
    subtitles: cuesForClip(cues, h.start, h.end),
    // 가장 크게 터진 순간 바로 앞에 "두둥"을 하나 넣어 둔다. 필요 없으면 지우면 된다.
    sfx: [{ id: newId(), at: round(Math.max(0, h.peak - h.start - 0.4)), kind: "boom" }],
  };
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function Choice<T extends string | number>({ value, options, onChange, format }: { value: T; options: T[]; onChange: (v: T) => void; format: (v: T) => string }) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "h-9 rounded-[8px] border px-3 text-[14px]",
            o === value ? "border-coral bg-coral/15 text-white" : "border-white/15 text-white/60 hover:bg-white/5",
          )}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}

export function Studio({ fonts }: { fonts: FontFamilies }) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [cues, setCues] = useState<Cue[]>([]);
  const [cueFileName, setCueFileName] = useState("");
  const [clipLength, setClipLength] = useState(45);
  const [clipCount, setClipCount] = useState(5);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [exporting, setExporting] = useState<{ label: string; ratio: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const template = findTemplate(templateId);
  const clip = clips.find((c) => c.id === selectedId) ?? null;
  const player = usePlayer(video, clip);
  const support = useMemo(
    () =>
      typeof window === "undefined"
        ? { analyze: true, record: true }
        : { analyze: typeof AudioDecoder !== "undefined", record: !!pickMimeType() },
    [],
  );

  // 캔버스에 쓸 글꼴을 미리 받아 둔다.
  useEffect(() => {
    const sample = "가나다 ABC 123";
    Promise.all([
      document.fonts.load(`${fonts.display.weight} 64px ${fonts.display.family}`, sample),
      document.fonts.load(`${fonts.body.weight} 64px ${fonts.body.family}`, sample),
    ])
      .catch(() => undefined)
      .finally(() => setFontsReady(true));
  }, [fonts]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // 작업 내용을 이 브라우저에 저장해 둔다. 같은 영상을 다시 올리면 이어서 할 수 있다.
  useEffect(() => {
    if (!file || !envelope || phase !== "edit") return;
    const id = setTimeout(() => {
      try {
        const data: Saved = {
          clips,
          templateId,
          envelope: { hop: envelope.hop, duration: envelope.duration, db: Array.from(envelope.db, (v) => Math.round(v * 10) / 10) },
        };
        localStorage.setItem(storageKey(file), JSON.stringify(data));
      } catch {
        // 저장 공간이 없거나 막혀 있으면 조용히 넘어간다.
      }
    }, 600);
    return () => clearTimeout(id);
  }, [file, envelope, clips, templateId, phase]);

  const updateClip = useCallback(
    (patch: Partial<Clip>) => {
      if (!selectedId) return;
      setClips((prev) => prev.map((c) => (c.id === selectedId ? { ...c, ...patch } : c)));
    },
    [selectedId],
  );

  // 스페이스바로 재생/멈춤 (글자 입력 중일 때는 제외)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Space" || e.defaultPrevented) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, button, [contenteditable]")) return;
      e.preventDefault();
      if (player.playing) player.pause();
      else player.play();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player]);

  function chooseFile(next: File | undefined) {
    if (!next) return;
    setError("");
    setFile(next);
    setSaved(loadSaved(next));
  }

  async function chooseSubtitleFile(next: File | undefined) {
    if (!next) return;
    const parsed = parseSubtitleFile(await next.text());
    if (!parsed.length) {
      setError("자막 파일을 읽지 못했어요. SRT 또는 VTT 파일인지 확인해 주세요.");
      return;
    }
    setError("");
    setCues(parsed);
    setCueFileName(next.name);
  }

  async function analyze() {
    if (!file) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("analyzing");
    setProgress(0);
    setError("");
    try {
      const env = await analyzeAudio(file, setProgress, controller.signal);
      const found = findHighlights(env, { length: clipLength, count: clipCount });
      const next = found.map((h) => makeClip(h, cues));
      if (!next.length) setError("뚜렷하게 터지는 구간을 찾지 못했어요. 위 그래프에서 위치를 고른 뒤 '지금 위치에 추가'로 직접 만들어 주세요.");
      setEnvelope(env);
      setClips(next);
      setSelectedId(next[0]?.id ?? null);
      setPhase("edit");
    } catch (e) {
      setPhase("upload");
      if ((e as Error).name !== "AbortError") setError((e as Error).message || "분석하지 못했어요.");
    }
  }

  function resume(data: Saved) {
    setEnvelope({ hop: data.envelope.hop, duration: data.envelope.duration, db: Float32Array.from(data.envelope.db) });
    setClips(data.clips);
    setTemplateId(data.templateId);
    setSelectedId(data.clips[0]?.id ?? null);
    setPhase("edit");
  }

  function addClipAtPlayhead() {
    if (!envelope) return;
    const start = round(Math.min(player.sourceTime, Math.max(0, envelope.duration - clipLength)));
    const next: Clip = {
      id: newId(),
      start,
      end: round(Math.min(envelope.duration, start + clipLength)),
      score: null,
      peak: null,
      title: "",
      bottom: "",
      zoom: 1,
      focusX: 0.5,
      subtitles: cuesForClip(cues, start, start + clipLength),
      sfx: [],
    };
    setClips((prev) => [...prev, next]);
    setSelectedId(next.id);
  }

  function removeClip(id: string) {
    const rest = clips.filter((c) => c.id !== id);
    setClips(rest);
    if (id === selectedId) setSelectedId(rest[0]?.id ?? null);
  }

  async function runExport(targets: Clip[]) {
    if (!sourceUrl || !file) return;
    player.pause();
    const controller = new AbortController();
    abortRef.current = controller;
    const base = file.name.replace(/\.[^.]+$/, "");
    const mime = pickMimeType() ?? "video/webm";
    try {
      for (const target of targets) {
        const index = clips.findIndex((c) => c.id === target.id) + 1;
        const label = `클립 ${index} 저장 중`;
        setExporting({ label, ratio: 0 });
        const blob = await exportClip({
          sourceUrl,
          clip: target,
          template,
          fonts,
          signal: controller.signal,
          onProgress: (ratio) => setExporting({ label, ratio }),
        });
        download(blob, `${base}_shorts${index}.${fileExtension(mime)}`);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message || "저장하지 못했어요.");
    } finally {
      setExporting(null);
    }
  }

  const header = (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
      <div className="flex items-center gap-2">
        <span className="text-[16px] font-bold text-white">쇼츠 편집기</span>
        <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[11px] text-coral">다니는다니</span>
      </div>
      {phase === "edit" && file && (
        <div className="flex min-w-0 items-center gap-2 text-[12px] text-white/50">
          <FileVideo className="size-4 shrink-0" />
          <span className="truncate">{file.name}</span>
          <Button
            size="sm"
            onClick={() => {
              player.pause();
              setPhase("upload");
            }}
          >
            다른 영상
          </Button>
        </div>
      )}
    </header>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[#101010] text-white">
      {header}

      {/* 원본 영상. 화면에는 보이지 않고 미리보기 캔버스에 그려진다. */}
      {sourceUrl && (
        <video
          ref={setVideo}
          src={sourceUrl}
          playsInline
          preload="auto"
          className="pointer-events-none fixed top-0 left-0 size-px opacity-0"
          aria-hidden
        />
      )}

      {error && (
        <p role="alert" className="mx-4 mt-4 rounded-[8px] border border-[#c9412f]/60 bg-[#c9412f]/15 px-4 py-3 text-[14px] text-[#ffb3a6]">
          {error}
        </p>
      )}

      {phase === "upload" && (
        <main className="mx-auto w-full max-w-[640px] px-4 py-10">
          <h1 className="text-[26px] leading-tight font-bold">롱폼 영상 → 쇼츠</h1>
          <p className="mt-2 text-[15px] leading-7 text-white/60">
            영상을 넣으면 소리가 크게 터지는 구간(웃음, 탄성, 강조)을 골라 줘요. 고른 구간에 헤드·바닥 문구, 자막, 효과음을 넣어 세로 영상으로 저장해요.
            영상은 이 컴퓨터 안에서만 다루고 어디에도 올라가지 않아요.
          </p>

          {(!support.analyze || !support.record) && (
            <p className="mt-4 rounded-[8px] bg-white/5 px-4 py-3 text-[13px] leading-6 text-white/70">
              이 브라우저에서는 일부 기능이 안 될 수 있어요. 컴퓨터의 최신 크롬이나 엣지에서 열어 주세요.
            </p>
          )}

          <label
            className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-white/20 bg-white/[0.03] px-6 py-12 text-center hover:border-coral/60"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              chooseFile(e.dataTransfer.files[0]);
            }}
          >
            <Upload className="size-8 text-coral" />
            <span className="text-[16px] font-bold">{file ? file.name : "롱폼 영상 파일을 끌어 넣거나 눌러서 고르기"}</span>
            <span className="text-[13px] text-white/50">
              {file ? `${(file.size / 1024 / 1024).toFixed(0)}MB · 다른 파일로 바꾸려면 다시 누르세요` : "MP4 권장 (MOV, WebM도 가능)"}
            </span>
            <input type="file" accept="video/*" className="sr-only" onChange={(e) => chooseFile(e.target.files?.[0])} />
          </label>

          {file && saved && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[10px] border border-coral/40 bg-coral/10 px-4 py-3">
              <span className="text-[14px]">이 영상으로 작업하던 내용이 있어요 (클립 {saved.clips.length}개).</span>
              <Button tone="primary" size="sm" onClick={() => resume(saved)}>
                이어서 하기
              </Button>
            </div>
          )}

          <div className="mt-8 grid gap-5">
            <div>
              <p className="mb-2 text-[14px] font-bold">클립 길이</p>
              <Choice value={clipLength} options={LENGTH_OPTIONS} onChange={setClipLength} format={(v) => `${v}초`} />
            </div>
            <div>
              <p className="mb-2 text-[14px] font-bold">몇 개 뽑을까요</p>
              <Choice value={clipCount} options={COUNT_OPTIONS} onChange={setClipCount} format={(v) => `${v}개`} />
            </div>
            <div>
              <p className="mb-1 text-[14px] font-bold">
                자막 파일 <span className="font-normal text-white/40">(선택)</span>
              </p>
              <p className="mb-2 text-[13px] leading-6 text-white/50">
                Vrew·캡컷·유튜브에서 받은 원본 전체 자막(SRT, VTT)을 넣으면 각 클립에 자막이 자동으로 들어가요.
              </p>
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[8px] border border-white/15 px-3 text-[14px] text-white/80 hover:bg-white/5">
                <Plus className="size-4" />
                {cueFileName ? `${cueFileName} (${cues.length}줄)` : "자막 파일 고르기"}
                <input type="file" accept=".srt,.vtt,text/vtt" className="sr-only" onChange={(e) => void chooseSubtitleFile(e.target.files?.[0])} />
              </label>
            </div>
          </div>

          <Button tone="primary" className="mt-10 h-12 w-full text-[16px]" disabled={!file} onClick={() => void analyze()}>
            터지는 구간 찾기
          </Button>
        </main>
      )}

      {phase === "analyzing" && (
        <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-4 py-10 text-center">
          <p className="text-[18px] font-bold">소리를 듣고 터지는 구간을 찾는 중…</p>
          <p className="mt-2 text-[13px] text-white/50">1시간 영상은 보통 1~3분 걸려요. 이 탭을 닫지 마세요.</p>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-coral transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="mt-2 text-[13px] tabular-nums text-white/60">{Math.round(progress * 100)}%</p>
          <Button className="mt-6" onClick={() => abortRef.current?.abort()}>
            멈추기
          </Button>
        </main>
      )}

      {phase === "edit" && envelope && (
        <main className="flex flex-1 flex-col">
          <div className="border-b border-white/10 px-4 py-3">
            <Timeline envelope={envelope} clips={clips} selectedId={selectedId} playhead={player.sourceTime} onSeek={player.seekSource} />
          </div>

          <div className="grid flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_380px]">
            {/* 클립 목록 */}
            <aside className="border-b border-white/10 lg:border-r lg:border-b-0">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h2 className="text-[14px] font-bold">클립 {clips.length}개</h2>
                <Button size="sm" onClick={addClipAtPlayhead} title="타임라인에서 고른 위치부터 새 클립을 만들어요">
                  <Plus className="size-3.5" />
                  지금 위치에 추가
                </Button>
              </div>
              <ul className="grid gap-1.5 px-3 pb-4">
                {clips.map((c, i) => (
                  <li key={c.id}>
                    <div
                      className={cn(
                        "group flex items-center gap-2 rounded-[10px] border px-3 py-2.5",
                        c.id === selectedId ? "border-coral bg-coral/10" : "border-white/10 hover:bg-white/5",
                      )}
                    >
                      <button type="button" onClick={() => setSelectedId(c.id)} className="min-w-0 flex-1 text-left">
                        <span className="flex items-center gap-2">
                          <span className="text-[14px] font-bold">#{i + 1}</span>
                          {c.score !== null && <span className="rounded-full bg-white/10 px-1.5 text-[11px] text-white/70">점수 {c.score}</span>}
                        </span>
                        <span className="mt-0.5 block text-[12px] tabular-nums text-white/50">
                          {formatTime(c.start)} ~ {formatTime(c.end)} · {Math.round(c.end - c.start)}초
                        </span>
                        {c.title && <span className="mt-0.5 block truncate text-[12px] text-white/70">{c.title.replace(/\*/g, "").replace(/\n/g, " ")}</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeClip(c.id)}
                        className="grid size-7 place-items-center rounded-[6px] text-white/30 hover:text-[#ff8a77]"
                        aria-label={`클립 ${i + 1} 지우기`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            {/* 미리보기 */}
            <section className="flex flex-col items-center gap-4 border-b border-white/10 px-4 py-5 lg:border-b-0">
              <div className="flex flex-wrap justify-center gap-1.5">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    title={t.description}
                    className={cn(
                      "h-8 rounded-full border px-3 text-[13px]",
                      t.id === templateId ? "border-coral bg-coral/15 text-white" : "border-white/15 text-white/60 hover:bg-white/5",
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {clip ? (
                <Preview video={video} clip={clip} template={template} fonts={fonts} fontsReady={fontsReady} player={player} />
              ) : (
                <p className="py-20 text-[14px] text-white/50">왼쪽에서 클립을 고르거나 새로 추가하세요.</p>
              )}

              <div className="flex w-full max-w-[340px] flex-col gap-2">
                <Button tone="primary" disabled={!clip || !!exporting || !support.record} onClick={() => clip && void runExport([clip])}>
                  <Download className="size-4" />이 클립 영상으로 저장
                </Button>
                <Button disabled={!clips.length || !!exporting || !support.record} onClick={() => void runExport(clips)}>
                  클립 {clips.length}개 모두 저장
                </Button>
                {exporting && (
                  <div className="rounded-[10px] bg-white/5 p-3">
                    <p className="text-[13px]">
                      {exporting.label} · {Math.round(exporting.ratio * 100)}%
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-coral" style={{ width: `${Math.round(exporting.ratio * 100)}%` }} />
                    </div>
                    <p className="mt-2 text-[12px] leading-5 text-white/50">클립 길이만큼 걸려요. 저장이 끝날 때까지 이 탭을 보고 있어 주세요.</p>
                    <Button size="sm" className="mt-2" onClick={() => abortRef.current?.abort()}>
                      멈추기
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* 편집 */}
            <aside className="border-white/10 lg:border-l">
              {clip ? (
                <ClipEditor key={clip.id} clip={clip} sourceDuration={envelope.duration} cues={cues} player={player} onChange={updateClip} />
              ) : null}
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}
