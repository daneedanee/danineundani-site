// 간단한 효과음. 음원 파일 없이 브라우저에서 소리를 직접 만들어서 저작권 걱정이 없다.
// 새 효과음을 넣으려면 SfxKind(types.ts)에 이름을 더하고 아래 sfxList와 makers에 추가한다.
import type { SfxKind } from "./types";

export const sfxList: { kind: SfxKind; label: string }[] = [
  { kind: "ding", label: "띵" },
  { kind: "pop", label: "뿅" },
  { kind: "whoosh", label: "휙" },
  { kind: "boom", label: "두둥" },
  { kind: "sparkle", label: "반짝" },
];

export function sfxLabel(kind: SfxKind) {
  return sfxList.find((s) => s.kind === kind)?.label ?? kind;
}

type Maker = (ctx: BaseAudioContext, when: number, out: AudioNode) => void;

function envelopeGain(ctx: BaseAudioContext, when: number, peak: number, attack: number, release: number, out: AudioNode) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + attack + release);
  gain.connect(out);
  return gain;
}

function tone(ctx: BaseAudioContext, type: OscillatorType, freq: number, when: number, length: number, out: AudioNode) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  osc.connect(out);
  osc.start(when);
  osc.stop(when + length + 0.05);
  return osc;
}

function noise(ctx: BaseAudioContext, when: number, length: number, out: AudioNode) {
  const size = Math.ceil(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(out);
  src.start(when);
  return src;
}

const makers: Record<SfxKind, Maker> = {
  ding(ctx, when, out) {
    const g = envelopeGain(ctx, when, 0.35, 0.005, 0.9, out);
    tone(ctx, "sine", 1318.5, when, 0.95, g);
    const g2 = envelopeGain(ctx, when, 0.12, 0.005, 0.5, out);
    tone(ctx, "sine", 2637, when, 0.55, g2);
  },
  pop(ctx, when, out) {
    const g = envelopeGain(ctx, when, 0.5, 0.005, 0.16, out);
    const osc = tone(ctx, "sine", 380, when, 0.18, g);
    osc.frequency.exponentialRampToValueAtTime(1400, when + 0.09);
  },
  whoosh(ctx, when, out) {
    const g = envelopeGain(ctx, when, 0.5, 0.18, 0.3, out);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(300, when);
    filter.frequency.exponentialRampToValueAtTime(3500, when + 0.35);
    filter.connect(g);
    noise(ctx, when, 0.5, filter);
  },
  boom(ctx, when, out) {
    for (const [offset, level] of [
      [0, 0.55],
      [0.28, 0.8],
    ] as const) {
      const t = when + offset;
      const g = envelopeGain(ctx, t, level, 0.005, 0.55, out);
      const osc = tone(ctx, "sine", 130, t, 0.6, g);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.45);
    }
  },
  sparkle(ctx, when, out) {
    [1568, 2093, 2637, 3136].forEach((freq, i) => {
      const t = when + i * 0.06;
      const g = envelopeGain(ctx, t, 0.16, 0.004, 0.35, out);
      tone(ctx, "triangle", freq, t, 0.4, g);
    });
  },
};

/** ctx 시간 when에 효과음을 예약한다. */
export function scheduleSfx(ctx: BaseAudioContext, kind: SfxKind, when: number, out: AudioNode) {
  makers[kind](ctx, Math.max(ctx.currentTime, when), out);
}
