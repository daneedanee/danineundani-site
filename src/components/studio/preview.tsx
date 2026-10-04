"use client";

// 세로 쇼츠 미리보기. 저장될 영상과 똑같은 그림을 그린다.
import { Pause, Play, SkipBack } from "lucide-react";
import { useEffect, useRef } from "react";

import { activeSubtitle, drawFrame, drawText, subtitleStyle } from "@/lib/studio/render";
import type { FontFamilies } from "@/lib/studio/render";
import { formatTime } from "@/lib/studio/subtitles";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/lib/studio/templates";
import type { Template, TextStyle } from "@/lib/studio/templates";
import type { Clip } from "@/lib/studio/types";

import type { Player } from "./use-player";

type Props = {
  video: HTMLVideoElement | null;
  clip: Clip;
  template: Template;
  fonts: FontFamilies;
  fontsReady: boolean;
  player: Player;
};

/** 비어 있는 문구 자리를 흐리게 보여준다. (미리보기에만 나오고 저장되는 영상에는 없다) */
function guideStyle(style: TextStyle): TextStyle {
  return { ...style, color: "rgba(160,160,160,0.45)", accent: "rgba(160,160,160,0.45)", stroke: undefined, box: undefined };
}

export function Preview({ video, clip, template, fonts, fontsReady, player }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rel = player.rel;
  const length = clip.end - clip.start;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const videoBottom = drawFrame(ctx, video, template, clip, rel, fonts);
    if (!activeSubtitle(clip.subtitles, rel)) {
      drawText(ctx, "자막 자리", guideStyle(subtitleStyle(template, clip, videoBottom)), fonts);
    }
    if (!clip.title.trim()) drawText(ctx, "헤드 문구 자리", guideStyle(template.header), fonts);
    if (!clip.bottom.trim()) drawText(ctx, "바닥 문구 자리", guideStyle(template.bottom), fonts);
  }, [video, clip, template, fonts, fontsReady, rel, player.frame]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="aspect-[9/16] w-full max-w-[340px] rounded-[12px] bg-black shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        onClick={() => (player.playing ? player.pause() : player.play())}
        aria-label="쇼츠 미리보기. 누르면 재생하거나 멈춥니다."
      />
      <div className="flex w-full max-w-[340px] items-center gap-2">
        <button
          type="button"
          onClick={() => player.seekRel(0)}
          className="grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10"
          aria-label="처음으로"
        >
          <SkipBack className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => (player.playing ? player.pause() : player.play())}
          className="grid size-10 place-items-center rounded-full bg-coral text-black hover:bg-[#ff8a77]"
          aria-label={player.playing ? "멈춤" : "재생"}
        >
          {player.playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-px" />}
        </button>
        <input
          type="range"
          min={0}
          max={length}
          step={0.1}
          value={Math.min(length, Math.max(0, rel))}
          onChange={(e) => player.seekRel(Number(e.target.value))}
          className="min-w-0 flex-1 accent-coral"
          aria-label="클립 안에서 위치 이동"
        />
        <span className="w-[84px] text-right text-[12px] tabular-nums text-white/60">
          {formatTime(rel, true)} / {formatTime(length)}
        </span>
      </div>
      <p className="text-[12px] text-white/40">스페이스바: 재생 / 멈춤</p>
    </div>
  );
}
