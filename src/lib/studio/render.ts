// 한 장면(프레임)을 그린다. 미리보기와 영상 저장이 모두 이 함수를 쓰므로 보이는 그대로 저장된다.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./templates";
import type { FontRole, Template, TextStyle } from "./templates";
import type { Clip } from "./types";

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

function wrap(ctx: CanvasRenderingContext2D, paragraphs: Word[][], maxWidth: number): Line[] {
  const lines: Line[] = [];
  for (const words of paragraphs) {
    let line: Line = [];
    let width = 0;
    for (const word of words) {
      const w = ctx.measureText(word.text).width;
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

function lineWidth(ctx: CanvasRenderingContext2D, line: Line) {
  return line.reduce((sum, w) => sum + ctx.measureText(w.text).width, 0);
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, style: TextStyle, fonts: FontFamilies) {
  if (!text.trim()) return;
  const maxWidth = CANVAS_WIDTH - SIDE_PADDING * 2 - (style.box ? 40 : 0);
  const paragraphs = parseRich(text);

  // 줄 수가 넘치면 글자를 조금씩 줄인다 (최소 60%까지).
  let size = style.size;
  let lines: Line[] = [];
  for (; size >= style.size * 0.6; size -= 4) {
    ctx.font = fontString(fonts, style.font, size);
    lines = wrap(ctx, paragraphs, maxWidth);
    if (lines.length <= style.maxLines) break;
  }
  lines = lines.slice(0, style.maxLines);

  const lineHeight = size * 1.28;
  const blockHeight = lineHeight * lines.length;
  const top = style.anchor === "top" ? style.y : style.y - blockHeight;

  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  lines.forEach((line, i) => {
    const width = lineWidth(ctx, line);
    const centerY = top + lineHeight * i + lineHeight / 2;
    let x = (CANVAS_WIDTH - width) / 2;

    if (style.box) {
      const padX = 28;
      const padY = size * 0.14;
      ctx.fillStyle = style.box;
      ctx.beginPath();
      ctx.roundRect(x - padX, centerY - lineHeight / 2 + padY / 2, width + padX * 2, lineHeight - padY, 18);
      ctx.fill();
    }

    for (const word of line) {
      if (style.stroke) {
        ctx.strokeStyle = style.stroke.color;
        ctx.lineWidth = style.stroke.width;
        ctx.strokeText(word.text, x, centerY);
      }
      ctx.fillStyle = word.accent ? style.accent : style.color;
      ctx.fillText(word.text, x, centerY);
      x += ctx.measureText(word.text).width;
    }
  });
}

export function drawVideo(ctx: CanvasRenderingContext2D, video: HTMLVideoElement | null, template: Template, clip: Clip) {
  const box = template.layout === "full" ? { top: 0, height: CANVAS_HEIGHT } : template.videoBox;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, box.top, CANVAS_WIDTH, box.height);
  ctx.clip();
  if (video && video.videoWidth && video.readyState >= 2) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const scale = Math.max(CANVAS_WIDTH / vw, box.height / vh) * clip.zoom;
    const dw = vw * scale;
    const dh = vh * scale;
    const dx = (CANVAS_WIDTH - dw) * clip.focusX;
    const dy = box.top + (box.height - dh) / 2;
    ctx.drawImage(video, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, box.top, CANVAS_WIDTH, box.height);
  }
  ctx.restore();
}

/** time: 클립 시작점부터 흐른 시간(초) */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement | null,
  template: Template,
  clip: Clip,
  time: number,
  fonts: FontFamilies,
) {
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawVideo(ctx, video, template, clip);
  drawText(ctx, clip.title, template.header, fonts);
  drawText(ctx, clip.bottom, template.bottom, fonts);
  const subtitle = clip.subtitles.find((s) => time >= s.start && time < s.end);
  if (subtitle) drawText(ctx, subtitle.text, template.subtitle, fonts);
}
