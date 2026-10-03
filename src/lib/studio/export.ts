// 클립 하나를 세로 쇼츠 영상 파일로 저장한다.
// 화면(캔버스)에 그리면서 동시에 녹화하는 방식이라 클립 길이만큼 시간이 걸린다. (45초 클립 → 약 45초)
// 녹화 중 다른 탭으로 넘어가면 브라우저가 그리기를 멈추므로, 저장이 끝날 때까지 이 탭을 띄워 둬야 한다.
import { drawFrame } from "./render";
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
  signal?: AbortSignal;
};

function once(target: EventTarget, event: string) {
  return new Promise<void>((resolve) => target.addEventListener(event, () => resolve(), { once: true }));
}

export async function exportClip({ sourceUrl, clip, template, fonts, onProgress, signal }: ExportOptions): Promise<Blob> {
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

  if (video.readyState < 1) await once(video, "loadedmetadata");
  video.currentTime = clip.start;
  await once(video, "seeked");
  drawFrame(ctx, video, template, clip, 0, fonts);

  const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...audioOut.stream.getAudioTracks()]);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000, audioBitsPerSecond: 192_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = once(recorder, "stop");

  const length = clip.end - clip.start;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    video.pause();
    if (recorder.state !== "inactive") recorder.stop();
  };
  signal?.addEventListener("abort", finish, { once: true });

  const draw = () => {
    if (finished) return;
    const t = video.currentTime - clip.start;
    drawFrame(ctx, video, template, clip, t, fonts);
    onProgress(Math.min(1, t / length));
    if (t >= length || video.ended) {
      finish();
      return;
    }
    if ("requestVideoFrameCallback" in video) video.requestVideoFrameCallback(draw);
    else requestAnimationFrame(draw);
  };

  recorder.start(1000);
  await video.play();
  // 재생이 실제로 시작된 시점을 기준으로 효과음을 예약한다.
  const base = audioContext.currentTime - (video.currentTime - clip.start);
  for (const cue of clip.sfx) scheduleSfx(audioContext, cue.kind, base + cue.at, audioOut);
  draw();
  video.addEventListener("timeupdate", () => {
    if (video.currentTime - clip.start >= length) finish();
  });
  video.addEventListener("ended", finish);

  await stopped;
  stream.getTracks().forEach((t) => t.stop());
  await audioContext.close();
  video.removeAttribute("src");
  video.load();

  if (signal?.aborted) throw new DOMException("저장을 멈췄어요.", "AbortError");
  onProgress(1);
  return new Blob(chunks, { type: mimeType.split(";")[0] });
}
