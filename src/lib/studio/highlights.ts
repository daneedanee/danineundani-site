// 소리 크기 흐름에서 "터지는 구간"을 고른다.
//
// 기준 (소리만 본다. 말의 내용은 보지 않는다):
// - 주변 1분 평소 목소리보다 갑자기 커진 순간(웃음, 탄성, 박수, 소리침)이 많을수록 점수가 높다.
// - 말이 끊기지 않고 이어질수록 점수가 높다. 조용한 시간이 길면 점수를 깎는다.
// - 고른 구간끼리는 겹치지 않는다.
// - 시작·끝은 말이 잠깐 멈춘 곳으로 옮겨서 말 중간에 잘리지 않게 한다.
import type { Envelope } from "./types";

export type Highlight = {
  start: number;
  end: number;
  /** 0~100 */
  score: number;
  /** 가장 크게 터진 순간 */
  peak: number;
};

export type HighlightOptions = {
  /** 클립 길이(초) */
  length: number;
  /** 몇 개를 고를지 */
  count: number;
};

function rollingMedian(values: Float32Array, radius: number, stride: number): Float32Array {
  // 모든 칸에서 정확히 구하면 느리므로 stride 칸마다 구하고 사이를 채운다.
  const out = new Float32Array(values.length);
  const anchors: { index: number; value: number }[] = [];
  for (let i = 0; i < values.length; i += stride) {
    const from = Math.max(0, i - radius);
    const to = Math.min(values.length, i + radius + 1);
    const window = Array.from(values.subarray(from, to)).sort((a, b) => a - b);
    anchors.push({ index: i, value: window[Math.floor(window.length / 2)] });
  }
  for (let a = 0; a < anchors.length; a++) {
    const cur = anchors[a];
    const next = anchors[a + 1];
    const end = next ? next.index : values.length;
    for (let i = cur.index; i < end; i++) {
      out[i] = next ? cur.value + ((next.value - cur.value) * (i - cur.index)) / (next.index - cur.index) : cur.value;
    }
  }
  return out;
}

/** 칸(hop)마다 "얼마나 터졌는지" 점수와 "소리가 있는지" 여부를 구한다. */
export function excitementCurve(envelope: Envelope) {
  const { db, hop } = envelope;
  const n = db.length;

  // 전체에서 너무 조용한 칸(무음) 기준: 하위 10% 소리보다 조금 큰 정도
  const sorted = Array.from(db).sort((a, b) => a - b);
  const floor = sorted[Math.floor(n * 0.1)] ?? -100;
  const loudRef = sorted[Math.floor(n * 0.95)] ?? 0;
  const silenceLine = floor + Math.max(6, (loudRef - floor) * 0.25);

  // 반초 단위로 부드럽게
  const smooth = new Float32Array(n);
  const half = Math.max(1, Math.round(0.25 / hop));
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let count = 0;
    for (let k = Math.max(0, i - half); k <= Math.min(n - 1, i + half); k++) {
      sum += db[k];
      count++;
    }
    smooth[i] = sum / count;
  }

  const baseline = rollingMedian(smooth, Math.round(30 / hop), Math.max(1, Math.round(2 / hop)));

  const excite = new Float32Array(n);
  const voiced = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    voiced[i] = smooth[i] > silenceLine ? 1 : 0;
    const lift = smooth[i] - baseline[i];
    // 평소보다 4dB 넘게 커진 부분부터 점수. 제곱해서 큰 폭발을 더 쳐준다.
    excite[i] = lift > 4 ? (lift - 4) ** 1.5 : 0;
  }
  return { excite, voiced, smooth, silenceLine };
}

function prefixSum(values: ArrayLike<number>) {
  const out = new Float64Array(values.length + 1);
  for (let i = 0; i < values.length; i++) out[i + 1] = out[i] + values[i];
  return out;
}

/** start 근처(앞 before초 ~ 뒤 after초)에서 가장 조용한 칸으로 옮긴다. */
function snapToPause(smooth: Float32Array, hop: number, time: number, before: number, after: number) {
  const center = Math.round(time / hop);
  const from = Math.max(0, center - Math.round(before / hop));
  const to = Math.min(smooth.length - 1, center + Math.round(after / hop));
  let best = center;
  let bestValue = Infinity;
  for (let i = from; i <= to; i++) {
    // 가운데에서 멀수록 조금 불리하게 해서 너무 멀리 가지 않게 한다.
    const value = smooth[i] + Math.abs(i - center) * hop * 0.8;
    if (value < bestValue) {
      bestValue = value;
      best = i;
    }
  }
  return Math.max(0, best * hop);
}

export function findHighlights(envelope: Envelope, options: HighlightOptions): Highlight[] {
  const { hop, duration } = envelope;
  const { excite, voiced, smooth } = excitementCurve(envelope);
  const n = excite.length;
  const win = Math.max(1, Math.round(options.length / hop));

  if (duration <= options.length + 2) {
    let peak = 0;
    for (let i = 1; i < n; i++) if (excite[i] > excite[peak]) peak = i;
    return [{ start: 0, end: Math.min(duration, options.length), score: 50, peak: peak * hop }];
  }

  const exciteSum = prefixSum(excite);
  const voicedSum = prefixSum(voiced);
  const step = Math.max(1, Math.round(1 / hop));

  type Candidate = { index: number; raw: number };
  const candidates: Candidate[] = [];
  for (let i = 0; i + win <= n; i += step) {
    const energy = exciteSum[i + win] - exciteSum[i];
    const voicedRatio = (voicedSum[i + win] - voicedSum[i]) / win;
    const silencePenalty = voicedRatio < 0.6 ? (0.6 - voicedRatio) * 2 : 0;
    const raw = energy * (0.5 + voicedRatio) * (1 - Math.min(0.9, silencePenalty));
    candidates.push({ index: i, raw });
  }
  candidates.sort((a, b) => b.raw - a.raw);

  // 가장 크게 터진 순간이 클립의 약 2/3 지점에 오도록 옮긴다. (앞에서 분위기가 쌓이고, 터진 뒤 반응까지 보이게)
  const top = candidates[0]?.raw || 1;
  const picked: (Candidate & { peak: number })[] = [];
  const gap = Math.round(5 / hop);
  for (const c of candidates) {
    if (picked.length >= options.count) break;
    // 거의 아무 일도 없는 구간은 고르지 않는다.
    if (c.raw < top * 0.05) break;
    let peak = c.index;
    for (let i = c.index; i < c.index + win; i++) if (excite[i] > excite[peak]) peak = i;
    const index = Math.max(0, Math.min(n - win, peak - Math.round(win * 0.65)));
    const overlaps = picked.some((p) => index < p.index + win + gap && p.index < index + win + gap);
    if (!overlaps) picked.push({ index, raw: c.raw, peak });
  }

  return picked
    .map((c) => {
      const peak = c.peak;
      const start = snapToPause(smooth, hop, c.index * hop, 2.5, 1);
      const end = Math.min(duration, snapToPause(smooth, hop, start + options.length, 1, 2.5));
      return {
        start,
        end: end > start + 3 ? end : Math.min(duration, start + options.length),
        // 1등을 100으로 두고 나머지는 상대 점수. 너무 낮게 보이지 않게 제곱근을 쓴다.
        score: Math.round(Math.sqrt(c.raw / top) * 100),
        peak: peak * hop,
      };
    })
    .sort((a, b) => b.score - a.score);
}
