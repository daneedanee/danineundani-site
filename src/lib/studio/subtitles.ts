// 자막 도우미.
import type { Subtitle } from "./types";

export const newId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export function round(value: number) {
  return Math.round(value * 10) / 10;
}

export type Cue = { start: number; end: number; text: string };

function parseTime(value: string): number {
  const m = value.trim().match(/(?:(\d+):)?(\d+):(\d+)[.,](\d+)/);
  if (!m) return NaN;
  const [, h, min, s, frac] = m;
  return Number(h ?? 0) * 3600 + Number(min) * 60 + Number(s) + Number(`0.${frac}`);
}

/** SRT·VTT 자막 파일을 읽는다. (Vrew, 캡컷, 유튜브 자동 자막 등에서 내려받은 파일) */
export function parseSubtitleFile(content: string): Cue[] {
  const cues: Cue[] = [];
  const blocks = content.replace(/\r/g, "").split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim());
    const timeIndex = lines.findIndex((l) => l.includes("-->"));
    if (timeIndex < 0) continue;
    const [from, to] = lines[timeIndex].split("-->");
    const start = parseTime(from);
    const end = parseTime(to.trim().split(/\s+/)[0]);
    const text = lines
      .slice(timeIndex + 1)
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (Number.isFinite(start) && Number.isFinite(end) && text) cues.push({ start, end, text });
  }
  return cues.sort((a, b) => a.start - b.start);
}

/** 원본 전체 자막 중 클립 구간에 걸치는 것만 클립 기준 시간으로 바꿔 가져온다. */
export function cuesForClip(cues: Cue[], clipStart: number, clipEnd: number): Subtitle[] {
  const length = clipEnd - clipStart;
  return cues
    .filter((c) => c.end > clipStart && c.start < clipEnd)
    .map((c) => ({
      id: newId(),
      start: round(Math.max(0, c.start - clipStart)),
      end: round(Math.min(length, c.end - clipStart)),
      text: c.text,
    }));
}

export function formatTime(seconds: number, withTenths = false) {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const tenths = Math.floor((s * 10) % 10);
  const base = `${h ? `${h}:${String(m).padStart(2, "0")}` : m}:${String(sec).padStart(2, "0")}`;
  return withTenths ? `${base}.${tenths}` : base;
}
