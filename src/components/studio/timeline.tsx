"use client";

// 원본 전체의 소리 크기 그래프. 고른 구간이 코랄색으로 표시된다. 누르면 그 위치로 이동한다.
import { useEffect, useMemo, useRef, useState } from "react";

import { formatTime } from "@/lib/studio/subtitles";
import type { Clip, Envelope } from "@/lib/studio/types";

// 캔버스 높이. 아래 className의 h-24(96px)와 같게 둔다.
const HEIGHT = 96;

type Props = {
  envelope: Envelope;
  clips: Clip[];
  selectedId: string | null;
  playhead: number;
  onSeek: (time: number) => void;
};

export function Timeline({ envelope, clips, selectedId, playhead, onSeek }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 그래프 높이 기준: 조용한 쪽 5%와 가장 큰 소리
  const range = useMemo(() => {
    const sorted = Array.from(envelope.db).sort((a, b) => a - b);
    return { low: sorted[Math.floor(sorted.length * 0.05)] ?? -60, high: sorted[sorted.length - 1] ?? 0 };
  }, [envelope]);

  // 칸마다 가장 큰 소리 (폭이 바뀔 때만 다시 계산)
  const columns = useMemo(() => {
    if (!width) return new Float32Array(0);
    const cols = new Float32Array(width);
    const per = envelope.db.length / width;
    for (let x = 0; x < width; x++) {
      let max = -Infinity;
      const from = Math.floor(x * per);
      const to = Math.max(from + 1, Math.floor((x + 1) * per));
      for (let i = from; i < to && i < envelope.db.length; i++) max = Math.max(max, envelope.db[i]);
      cols[x] = Math.max(0, Math.min(1, (max - range.low) / (range.high - range.low || 1)));
    }
    return cols;
  }, [envelope, width, range]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = HEIGHT * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, HEIGHT);

    const toX = (t: number) => (t / envelope.duration) * width;

    clips.forEach((clip, index) => {
      const x = toX(clip.start);
      const w = Math.max(2, toX(clip.end) - x);
      const selected = clip.id === selectedId;
      ctx.fillStyle = selected ? "rgba(253,113,91,0.35)" : "rgba(253,113,91,0.15)";
      ctx.fillRect(x, 0, w, HEIGHT);
      ctx.fillStyle = selected ? "#fd715b" : "rgba(253,113,91,0.7)";
      ctx.fillRect(x, 0, w, 3);
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(String(index + 1), x + 3, 15);
    });

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    const mid = HEIGHT / 2 + 6;
    for (let x = 0; x < columns.length; x++) {
      const h = Math.max(1, columns[x] * (HEIGHT - 26));
      ctx.fillRect(x, mid - h / 2, 1, h);
    }

    const px = toX(playhead);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px - 1, 0, 2, HEIGHT);
  }, [columns, clips, selectedId, playhead, width, envelope.duration]);

  function timeAt(clientX: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, Math.min(envelope.duration, ((clientX - rect.left) / rect.width) * envelope.duration));
  }

  return (
    <div ref={wrapRef} className="relative select-none">
      <canvas
        ref={canvasRef}
        className="block h-24 w-full cursor-pointer rounded-[8px] bg-black/50"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onSeek(timeAt(e.clientX));
        }}
        onPointerMove={(e) => {
          setHover(timeAt(e.clientX));
          if (e.buttons === 1) onSeek(timeAt(e.clientX));
        }}
        onPointerLeave={() => setHover(null)}
        aria-label="원본 영상 전체 소리 그래프. 누르면 그 위치로 이동합니다."
      />
      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-white/40">
        <span>0:00</span>
        <span>{hover !== null ? `여기: ${formatTime(hover)}` : `지금: ${formatTime(playhead)}`}</span>
        <span>{formatTime(envelope.duration)}</span>
      </div>
    </div>
  );
}
