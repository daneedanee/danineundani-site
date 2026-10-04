// 클립 하나를 세로 쇼츠 영상 파일로 저장한다.
// 화면(캔버스)에 그리면서 동시에 녹화하는 방식이라 클립 길이만큼 시간이 걸린다. (45초 클립 → 약 45초)
// 컷이 여러 개면 컷을 차례로 재생하며 이어서 녹화한다. 컷을 넘어가는 순간에는 녹화를 잠깐 멈춘다.
// 녹화 중 다른 탭으로 넘어가면 브라우저가 화면 그리기를 멈춘다. 그래서 탭이 가려지면 녹화를 잠깐 멈추고,
// 다시 돌아오면 이어서 녹화한다. (가려진 동안 화면 없이 소리만 녹화되던 문제를 막기 위해)
import { drawFrame } from "./render";
import { clipDuration, clipSegments, segmentOffsets } from "./segments";
import type { FontFamilies } from "./render";
import { scheduleSfx } from "./sfx";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./templates";
import type { Template } from "./templates";
import type { Clip } from "./types";

const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.640028,mp4a.40.2",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

export function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

export function fileExtension(mimeType: string) {
  return mimeType.startsWith("video/mp4") ? "mp4" : "webm";
}

type ExportOptions = {
  sourceUrl: string;
  clip: Clip;
  template: Template;
  fonts: FontFamilies;
  onProgress: (ratio: number) => void;
  /** 탭이 가려져서 저장이 잠깐 멈추면 true, 다시 이어지면 false */
  onPausedChange?: (paused: boolean) => void;
  signal?: AbortSignal;
};

function once(target: EventTarget, event: string) {
  return new Promise<void>((resolve) => target.addEventListener(event, () => resolve(), { once: true }));
}

export async function exportClip({ sourceUrl, clip, template, fonts, onProgress, onPausedChange, signal }: ExportOptions): Promise<Blob> {
  const mimeType = pickMimeType();
  if (!mimeType) throw new Error("이 브라우저는 영상 저장을 지원하지 않아요. 최신 크롬이나 엣지에서 열어 주세요.");

  const audioContext = new AudioContext();
  const video = document.createElement("video");
  video.src = sourceUrl;
  video.playsInline = true;
  video.preload = "auto";

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("화면을 그릴 수 없어요.");

  // 영상 소리 + 효과음을 한데 모아 녹화한다. 스피커로는 내보내지 않는다.
  const audioOut = audioContext.createMediaStreamDestination();
  audioContext.createMediaElementSource(video).connect(audioOut);
  await audioContext.resume();

  const segments = clipSegments(clip);
  const offsets = segmentOffsets(segments);
  const total = clipDuration(clip);

  if (video.readyState < 1) await once(video, "loadedmetadata");
  video.currentTime = segments[0].start;
  await once(video, "seeked");
  drawFrame(ctx, video, template, clip, 0, fonts);

  const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...audioOut.stream.getAudioTracks()]);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000, audioBitsPerSecond: 192_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = once(recorder, "stop");

  let finished = false;
  /** 컷을 재생하며 녹화하는 중인지 (컷 사이를 넘어가는 동안은 false) */
  let playing = false;
  /** 탭이 가려져서 잠깐 멈춘 상태인지 */
  let hiddenPaused = false;
  let segIndex = 0;
  let segDone: (() => void) | null = null;

  // 화면을 30분의 1초마다 그린다. requestVideoFrameCallback은 탭이 가려지면 멈춰서,
  // 그 동안 화면 없이 소리만 녹화되는 문제가 있었다 (2026-10-04). 그래서 탭이 가려지면 아래에서 녹화 자체를 멈춘다.
  const tick = () => {
    if (finished || !playing || hiddenPaused) return;
    const seg = segments[segIndex];
    const t = offsets[segIndex] + Math.max(0, video.currentTime - seg.start);
    drawFrame(ctx, video, template, clip, t, fonts);
    onProgress(Math.min(1, t / total));
    if ((video.currentTime >= seg.end || video.ended) && segDone) {
      const done = segDone;
      segDone = null;
      done();
    }
  };
  const timer = setInterval(tick, 1000 / 30);

  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    video.pause();
    if (recorder.state !== "inactive") recorder.stop();
    segDone?.();
  };
  signal?.addEventListener("abort", finish, { once: true });

  // 탭이 가려지면 영상·녹화·효과음 시계를 함께 멈추고, 다시 보이면 이어서 녹화한다.
  const onVisibility = () => {
    if (finished || !playing) return;
    if (document.hidden && !hiddenPaused) {
      hiddenPaused = true;
      video.pause();
      if (recorder.state === "recording") recorder.pause();
      void audioContext.suspend();
      onPausedChange?.(true);
    } else if (!document.hidden && hiddenPaused) {
      void (async () => {
        await audioContext.resume();
        if (recorder.state === "paused") recorder.resume();
        await video.play();
        hiddenPaused = false;
        onPausedChange?.(false);
      })();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  /** 탭이 보일 때까지 기다린다. (가려진 채로 녹화를 시작하지 않게) */
  const waitUntilVisible = async () => {
    if (!document.hidden) return;
    onPausedChange?.(true);
    while (document.hidden && !finished) await once(document, "visibilitychange");
    onPausedChange?.(false);
  };

  await waitUntilVisible();
  recorder.start(1000);
  for (let i = 0; i < segments.length && !finished; i++) {
    if (i > 0) {
      // 다음 컷으로 넘어가는 동안은 녹화를 잠깐 멈춰서, 멈춘 화면이 영상에 들어가지 않게 한다.
      video.pause();
      recorder.pause();
      video.currentTime = segments[i].start;
      await once(video, "seeked");
      drawFrame(ctx, video, template, clip, offsets[i], fonts);
      await waitUntilVisible();
      recorder.resume();
    }
    segIndex = i;
    const segmentFinished = new Promise<void>((resolve) => {
      segDone = resolve;
    });
    await video.play();
    playing = true;
    // 이 컷이 실제로 재생되기 시작한 시점을 기준으로, 이 컷 안의 효과음만 예약한다.
    const base = audioContext.currentTime - (video.currentTime - segments[i].start);
    const segEnd = offsets[i] + (segments[i].end - segments[i].start);
    for (const cue of clip.sfx) {
      if (cue.at >= offsets[i] && cue.at < segEnd) scheduleSfx(audioContext, cue.kind, base + (cue.at - offsets[i]), audioOut);
    }
    // 재생이 끝난 직후 탭이 가려졌다면 바로 멈춘다.
    onVisibility();
    await segmentFinished;
    playing = false;
  }
  finish();
  document.removeEventListener("visibilitychange", onVisibility);

  await stopped;
  stream.getTracks().forEach((t) => t.stop());
  await audioContext.close();
  video.removeAttribute("src");
  video.load();

  if (signal?.aborted) throw new DOMException("저장을 멈췄어요.", "AbortError");
  onProgress(1);
  return new Blob(chunks, { type: mimeType.split(";")[0] });
}
