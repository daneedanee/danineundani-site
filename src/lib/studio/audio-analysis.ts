// 영상의 소리 크기 흐름(Envelope)을 뽑는다. 영상은 서버로 보내지 않고 브라우저 안에서만 읽는다.
//
// 1) MP4·MOV: 파일 구조를 읽어 소리 데이터가 있는 곳만 골라 읽고, 브라우저의 WebCodecs로 푼다.
//    영상 데이터는 읽지 않으므로 1시간이 넘는 몇 GB짜리 영상도 빠르고 메모리를 거의 쓰지 않는다.
// 2) 그 밖의 형식(WebM 등)이나 1)이 안 되는 브라우저: 파일 전체를 한 번에 풀어 읽는다 (1.5GB 이하만).
import { createFile, MP4BoxBuffer } from "mp4box";
import type { ISOFile, Movie, Sample } from "mp4box";

import type { Envelope } from "./types";

/** 소리 크기를 재는 간격(초) */
export const HOP = 0.1;

const CHUNK_SIZE = 4 * 1024 * 1024;
const FALLBACK_MAX_BYTES = 1.5 * 1024 * 1024 * 1024;

export type ProgressFn = (ratio: number) => void;

/** 시간 칸마다 소리 에너지(제곱합)를 모은다. */
class EnergyBins {
  private sums: Float64Array;
  private counts: Uint32Array;

  constructor(readonly duration: number) {
    const size = Math.max(1, Math.ceil(duration / HOP) + 1);
    this.sums = new Float64Array(size);
    this.counts = new Uint32Array(size);
  }

  add(startTime: number, sampleRate: number, data: Float32Array, length = data.length) {
    const samplesPerBin = sampleRate * HOP;
    let pos = startTime * sampleRate;
    let i = 0;
    while (i < length) {
      const bin = Math.floor(pos / samplesPerBin);
      if (bin >= this.sums.length) break;
      const binEnd = Math.min(length, i + Math.max(1, Math.ceil((bin + 1) * samplesPerBin - pos)));
      let sum = 0;
      for (let k = i; k < binEnd; k++) sum += data[k] * data[k];
      if (bin >= 0) {
        this.sums[bin] += sum;
        this.counts[bin] += binEnd - i;
      }
      pos += binEnd - i;
      i = binEnd;
    }
  }

  toEnvelope(): Envelope {
    const db = new Float32Array(this.sums.length);
    for (let i = 0; i < db.length; i++) {
      db[i] = this.counts[i] ? 10 * Math.log10(this.sums[i] / this.counts[i] + 1e-10) : -100;
    }
    return { hop: HOP, db, duration: this.duration };
  }
}

function isMp4Like(file: File) {
  return /\.(mp4|m4v|mov)$/i.test(file.name) || file.type === "video/mp4" || file.type === "video/quicktime";
}

type Descriptor = { findDescriptor?: (tag: number) => Descriptor | undefined; data?: Uint8Array };

/** AAC 디코더에 넘길 설정값(AudioSpecificConfig)을 esds 상자에서 꺼낸다. */
function audioDescription(file: ISOFile, trackId: number): Uint8Array | undefined {
  const trak = file.getTrackById(trackId) as unknown as {
    mdia?: { minf?: { stbl?: { stsd?: { entries?: { esds?: { esd?: Descriptor } }[] } } } };
  };
  const esd = trak.mdia?.minf?.stbl?.stsd?.entries?.[0]?.esds?.esd;
  return esd?.findDescriptor?.(4)?.findDescriptor?.(5)?.data;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function aborted(): never {
  throw new DOMException("분석을 멈췄어요.", "AbortError");
}

/** 파일 구조(moov)만 읽는다. moov가 파일 끝에 있어도 영상 데이터는 건너뛴다. */
async function readMovieInfo(file: File, signal?: AbortSignal): Promise<{ mp4: ISOFile; info: Movie } | null> {
  const mp4 = createFile();
  let info: Movie | null = null;
  let failed = false;
  mp4.onReady = (movie) => {
    info = movie;
  };
  mp4.onError = () => {
    failed = true;
  };

  let offset = 0;
  for (let step = 0; step < 200 && offset < file.size && !info && !failed; step++) {
    if (signal?.aborted) aborted();
    const buffer = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer();
    const next = mp4.appendBuffer(MP4BoxBuffer.fromArrayBuffer(buffer, offset));
    offset = typeof next === "number" && next > offset ? next : offset + buffer.byteLength;
  }
  mp4.flush();
  const movie = info as Movie | null;
  return movie ? { mp4, info: movie } : null;
}

/** 성공하면 Envelope, 이 방법을 쓸 수 없으면 null */
async function analyzeMp4(file: File, onProgress: ProgressFn, signal?: AbortSignal): Promise<Envelope | null> {
  if (typeof AudioDecoder === "undefined" || !isMp4Like(file)) return null;

  const parsed = await readMovieInfo(file, signal);
  if (!parsed) return null;
  const { mp4, info } = parsed;

  const track = info.audioTracks[0];
  if (!track?.audio) throw new Error("이 영상에는 소리가 없어서 터지는 구간을 찾을 수 없어요.");
  const samples = (mp4.getTrackSamplesInfo(track.id) ?? []) as Sample[];
  if (!samples.length) return null;

  const duration = info.duration && info.timescale ? info.duration / info.timescale : track.duration / track.timescale;
  const bins = new EnergyBins(duration);
  let failure: unknown = null;
  let scratch = new Float32Array(0);

  const config: AudioDecoderConfig = {
    codec: track.codec.startsWith("mp4a") ? track.codec : track.codec.toLowerCase(),
    sampleRate: track.audio.sample_rate,
    numberOfChannels: track.audio.channel_count,
    description: audioDescription(mp4, track.id),
  };
  const support = await AudioDecoder.isConfigSupported(config).catch(() => null);
  if (!support?.supported) return null;

  const decoder = new AudioDecoder({
    output: (audio) => {
      const frames = audio.numberOfFrames;
      if (scratch.length < frames) scratch = new Float32Array(frames);
      audio.copyTo(scratch, { planeIndex: 0, format: "f32-planar" });
      bins.add(audio.timestamp / 1e6, audio.sampleRate, scratch, frames);
      audio.close();
    },
    error: (error) => {
      failure = error;
    },
  });
  decoder.configure(config);

  try {
    // 소리 데이터는 파일 곳곳에 작은 덩어리로 흩어져 있다. 붙어 있는 것끼리 묶어서 읽는다.
    let i = 0;
    while (i < samples.length) {
      if (signal?.aborted) aborted();
      const from = samples[i].offset;
      let to = from + samples[i].size;
      let j = i + 1;
      while (
        j < samples.length &&
        samples[j].offset >= to &&
        samples[j].offset - to < 64 * 1024 &&
        samples[j].offset + samples[j].size - from < CHUNK_SIZE
      ) {
        to = samples[j].offset + samples[j].size;
        j++;
      }
      const buffer = await file.slice(from, to).arrayBuffer();
      for (let k = i; k < j; k++) {
        const s = samples[k];
        decoder.decode(
          new EncodedAudioChunk({
            type: "key",
            timestamp: (s.cts * 1e6) / s.timescale,
            duration: (s.duration * 1e6) / s.timescale,
            data: new Uint8Array(buffer, s.offset - from, s.size),
          }),
        );
      }
      i = j;
      if (failure) return null;
      while (decoder.decodeQueueSize > 64) await wait(2);
      onProgress(Math.min(0.99, i / samples.length));
    }
    await decoder.flush();
  } finally {
    if (decoder.state !== "closed") decoder.close();
  }

  if (failure) return null;
  onProgress(1);
  return bins.toEnvelope();
}

async function analyzeWhole(file: File, onProgress: ProgressFn): Promise<Envelope> {
  if (file.size > FALLBACK_MAX_BYTES) {
    throw new Error("이 형식의 영상은 1.5GB 이하만 분석할 수 있어요. MP4로 저장해서 다시 올려 주세요.");
  }
  onProgress(0.1);
  const context = new OfflineAudioContext(1, 1, 16000);
  const audio = await context.decodeAudioData(await file.arrayBuffer());
  onProgress(0.8);
  const bins = new EnergyBins(audio.duration);
  bins.add(0, audio.sampleRate, audio.getChannelData(0));
  onProgress(1);
  return bins.toEnvelope();
}

export async function analyzeAudio(file: File, onProgress: ProgressFn, signal?: AbortSignal): Promise<Envelope> {
  const fast = await analyzeMp4(file, onProgress, signal);
  if (fast) return fast;
  return analyzeWhole(file, onProgress);
}
