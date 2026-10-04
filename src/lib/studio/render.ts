// 한 장면(프레임)을 그린다. 미리보기와 영상 저장이 모두 이 함수를 쓰므로 보이는 그대로 저장된다.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./templates";
import type { FontRole, Template, TextStyle } from "./templates";
import type { Clip, Subtitle } from "./types";

export type FontFamilies = Record<FontRole, { family: string; weight: number }>;

type Word = { text: string; accent: boolean };
type Line = Word[];

const SIDE_PADDING = 60;

/** "*강조*" 표시를 읽어 줄 → 단어 목록으로 바꾼다. */
function parseRich(text: string): Word[][] {
  return text.split("\n").map((raw) => {
    const words: Word[] = [];
    raw.split("*").forEach((part, index) => {
      const accent = index % 2 === 1;
      part.split(/(\s+)/).forEach((token) => {
        if (token) words.push({ text: token, accent });
      });
    });
    return words;
  });
}

function fontString(fonts: FontFamilies, role: FontRole, size: number) {
  const f = fonts[role];
  return `${f.weight} ${size}px ${f.family}`;
}

/** 띄어쓰기 칸은 spaceScale배로 좁혀서 잰다. */
function wordWidth(ctx: CanvasRenderingContext2D, word: Word, spaceScale: number) {
  const width = ctx.measureText(word.text).width;
  return word.text.trim() ? width : width * spaceScale;
}

function wrap(ctx: CanvasRenderingContext2D, paragraphs: Word[][], maxWidth: number, spaceScale: number): Line[] {
  const lines: Line[] = [];
  for (const words of paragraphs) {
    let line: Line = [];
    let width = 0;
    for (const word of words) {
      const w = wordWidth(ctx, word, spaceScale);
      const isSpace = !word.text.trim();
      if (line.length && !isSpace && width + w > maxWidth) {
        lines.push(trimLine(line));
        line = [];
        width = 0;
      }
      if (!line.length && isSpace) continue;
      line.push(word);
      width += w;
    }
    if (line.length) lines.push(trimLine(line));
  }
  return lines.filter((l) => l.length);
}

function trimLine(line: Line): Line {
  const out = [...line];
  while (out.length && !out[out.length - 1].text.trim()) out.pop();
  return out;
}

function lineWidth(ctx: CanvasRenderingContext2D, line: Line, spaceScale: number) {
  return line.reduce((sum, w) => sum + wordWidth(ctx, w, spaceScale), 0);
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, style: TextStyle, fonts: FontFamilies) {
  if (!text.trim()) return;
  const maxWidth = CANVAS_WIDTH - (style.sidePadding ?? SIDE_PADDING) * 2 - (style.box ? 40 : 0);
  const paragraphs = parseRich(text);
  const spaceScale = style.spaceScale ?? 1;

  // 줄 수가 넘치면 글자를 조금씩 줄인다 (최소 60%까지).
  let size = style.size;
  let lines: Line[] = [];
  for (; size >= style.size * 0.6; size -= 4) {
    ctx.font = fontString(fonts, style.font, size);
    ctx.letterSpacing = `${(style.letterSpacing ?? 0) * size}px`;
    lines = wrap(ctx, paragraphs, maxWidth, spaceScale);
    if (lines.length <= style.maxLines) break;
  }
  lines = lines.slice(0, style.maxLines);

  const lineHeight = size * (style.lineHeight ?? 1.28);
  const blockHeight = lineHeight * lines.length;
  const top = style.anchor === "top" ? style.y : style.y - blockHeight;

  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  lines.forEach((line, i) => {
    const width = lineWidth(ctx, line, spaceScale);
    const centerY = top + lineHeight * i + lineHeight / 2;
    let x = (CANVAS_WIDTH - width) / 2;

    if (style.box) {
      const padX = Math.round(size * 0.3);
      const padY = size * 0.14;
      ctx.fillStyle = style.box;
      ctx.beginPath();
      ctx.roundRect(x - padX, centerY - lineHeight / 2 + padY / 2, width + padX * 2, lineHeight - padY, style.boxRadius ?? 18);
      ctx.fill();
    }

    if (style.shadow) {
      ctx.shadowColor = style.shadow;
      ctx.shadowBlur = size * 0.2;
      ctx.shadowOffsetY = size * 0.04;
    }

    for (const word of line) {
      if (style.stroke) {
        ctx.strokeStyle = style.stroke.color;
        ctx.lineWidth = style.stroke.width;
        ctx.strokeText(word.text, x, centerY);
      }
      ctx.fillStyle = word.accent ? style.accent : style.color;
      ctx.fillText(word.text, x, centerY);
      x += wordWidth(ctx, word, spaceScale);
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  });
  ctx.letterSpacing = "0px";
}

/** time(초)에 보여야 할 자막. 소수 계산 오차로 시작 시각에 딱 맞춰 이동해도 안 보이는 일이 없게 조금 여유를 둔다. */
export function activeSubtitle(subtitles: Subtitle[], time: number) {
  const t = time + 0.001;
  return subtitles.find((s) => t >= s.start && t < s.end);
}

/** 영상을 그리고, 보이는 영상의 아랫변 y를 돌려준다. */
export function drawVideo(ctx: CanvasRenderingContext2D, video: HTMLVideoElement | null, template: Template, clip: Clip): number {
  const box = template.layout === "full" ? { top: 0, height: CANVAS_HEIGHT } : template.videoBox;
  const boxBottom = box.top + box.height;
  const cropBottom = clip.cropBottom ?? template.cropBottom ?? 0;
  const zoom = template.videoZoom * clip.zoom;
  const ready = !!video && video.videoWidth > 0 && video.readyState >= 2;
  // 영상을 아직 못 읽었으면 16:9로 보고 자리를 잡는다.
  const vw = ready ? video.videoWidth : 1920;
  const vh = ready ? video.videoHeight : 1080;

  const scale = template.videoFit === "width" ? (CANVAS_WIDTH / vw) * zoom : Math.max(CANVAS_WIDTH / vw, box.height / vh) * zoom;
  const dw = vw * scale;
  const dh = vh * scale;
  const dx = (CANVAS_WIDTH - dw) * clip.focusX;
  const dy = template.videoFit === "width" ? box.top : box.top + (box.height - dh) / 2;
  const visibleBottom = Math.min(boxBottom, dy + dh * (1 - cropBottom));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, box.top, CANVAS_WIDTH, Math.max(0, visibleBottom - box.top));
  ctx.clip();
  if (ready) {
    ctx.drawImage(video, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, box.top, CANVAS_WIDTH, box.height);
  }
  ctx.restore();
  return visibleBottom;
}

/** 클립별 자막 위치 조정과 "영상 아랫변 기준"을 반영한 자막 모양 */
export function subtitleStyle(template: Template, clip: Clip, videoBottom: number): TextStyle {
  const style = template.subtitle;
  const base = style.from === "videoBottom" ? videoBottom : 0;
  return { ...style, y: base + style.y + (clip.subtitleY ?? 0) };
}

/** time: 클립 시작점부터 흐른 시간(초). 보이는 영상의 아랫변 y를 돌려준다. */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement | null,
  template: Template,
  clip: Clip,
  time: number,
  fonts: FontFamilies,
): number {
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const videoBottom = drawVideo(ctx, video, template, clip);
  if (template.topShade) {
    const { height, opacity } = template.topShade;
    const shade = ctx.createLinearGradient(0, 0, 0, height);
    shade.addColorStop(0, `rgba(0,0,0,${opacity})`);
    shade.addColorStop(0.6, `rgba(0,0,0,${opacity * 0.6})`);
    shade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, CANVAS_WIDTH, height);
  }
  drawText(ctx, clip.title, template.header, fonts);
  drawText(ctx, clip.bottom, template.bottom, fonts);
  const subtitle = activeSubtitle(clip.subtitles, time);
  if (subtitle) drawText(ctx, subtitle.text, subtitleStyle(template, clip, videoBottom), fonts);
  return videoBottom;
}
