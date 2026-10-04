// 여러 컷을 이어붙인 클립의 시간 계산.
// "클립 시간(rel)"은 컷들을 이어붙인 뒤의 시간이고, "원본 시간"은 원본 영상에서의 시간이다.
import type { Clip, Segment } from "./types";

type ClipRange = Pick<Clip, "start" | "end" | "segments">;

export function clipSegments(clip: ClipRange): Segment[] {
  return clip.segments?.length ? clip.segments : [{ start: clip.start, end: clip.end }];
}

export function clipDuration(clip: ClipRange) {
  return clipSegments(clip).reduce((sum, s) => sum + Math.max(0, s.end - s.start), 0);
}

/** 각 컷이 클립 시간 몇 초에 시작하는지 */
export function segmentOffsets(segments: Segment[]) {
  const offsets: number[] = [];
  let t = 0;
  for (const s of segments) {
    offsets.push(t);
    t += Math.max(0, s.end - s.start);
  }
  return offsets;
}

/** 클립 시간 → 원본 시간과 몇 번째 컷인지 */
export function relToSource(clip: ClipRange, rel: number): { time: number; index: number } {
  const segments = clipSegments(clip);
  const offsets = segmentOffsets(segments);
  for (let i = segments.length - 1; i >= 0; i--) {
    if (rel >= offsets[i] || i === 0) {
      const s = segments[i];
      return { time: Math.min(s.end, s.start + Math.max(0, rel - offsets[i])), index: i };
    }
  }
  return { time: segments[0].start, index: 0 };
}

/** 원본 시간 → 클립 시간. 어느 컷에도 없으면 가장 가까운 앞 컷 기준으로 계산한다. */
export function sourceToRel(clip: ClipRange, time: number) {
  const segments = clipSegments(clip);
  const offsets = segmentOffsets(segments);
  const inside = segments.findIndex((s) => time >= s.start && time < s.end);
  if (inside >= 0) return offsets[inside] + time - segments[inside].start;
  let before = -1;
  segments.forEach((s, i) => {
    if (s.start <= time && (before < 0 || s.start >= segments[before].start)) before = i;
  });
  if (before < 0) return time - segments[0].start;
  return offsets[before] + time - segments[before].start;
}

/** 컷 목록을 바꿀 때 함께 바뀌어야 할 값들 */
export function segmentsPatch(segments: Segment[]): Pick<Clip, "segments" | "start" | "end"> {
  return {
    segments,
    start: Math.min(...segments.map((s) => s.start)),
    end: Math.max(...segments.map((s) => s.end)),
  };
}
