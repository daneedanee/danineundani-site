"use client";

// 미리보기 재생 조작. 원본 <video>를 클립 구간 안에서만 재생하고, 효과음을 맞춰 튼다.
import { useCallback, useEffect, useRef, useState } from "react";

import { scheduleSfx } from "@/lib/studio/sfx";
import type { Clip, SfxKind } from "@/lib/studio/types";

export type Player = {
  playing: boolean;
  /** 원본 기준 현재 시간 */
  sourceTime: number;
  /** 클립 시작점 기준 현재 시간 */
  rel: number;
  /** 화면을 다시 그려야 할 때마다 1씩 오른다 */
  frame: number;
  play: (fromRel?: number) => void;
  pause: () => void;
  seekRel: (rel: number) => void;
  seekSource: (time: number) => void;
  previewSfx: (kind: SfxKind) => void;
};

/** 재생 위치를 옮긴다. (훅 인자를 직접 고치지 않도록 따로 둔다) */
function setVideoTime(el: HTMLVideoElement, time: number) {
  el.currentTime = time;
}

export function usePlayer(video: HTMLVideoElement | null, clip: Clip | null): Player {
  const [playing, setPlaying] = useState(false);
  const [sourceTime, setSourceTime] = useState(0);
  const [frame, setFrame] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  const sfxBusRef = useRef<GainNode | null>(null);
  const clipRef = useRef(clip);

  useEffect(() => {
    clipRef.current = clip;
  }, [clip]);

  const audio = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    void audioRef.current.resume();
    return audioRef.current;
  }, []);

  const stopSfx = useCallback(() => {
    sfxBusRef.current?.disconnect();
    sfxBusRef.current = null;
  }, []);

  const pause = useCallback(() => {
    video?.pause();
    stopSfx();
    setPlaying(false);
  }, [video, stopSfx]);

  const play = useCallback(
    (fromRel?: number) => {
      const current = clipRef.current;
      if (!video || !current) return;
      const length = current.end - current.start;
      let t = fromRel ?? video.currentTime - current.start;
      if (t < 0 || t >= length - 0.05) t = 0;
      setVideoTime(video, current.start + t);
      void video.play();
      setPlaying(true);

      stopSfx();
      const ctx = audio();
      const bus = ctx.createGain();
      bus.connect(ctx.destination);
      sfxBusRef.current = bus;
      for (const cue of current.sfx) {
        if (cue.at >= t - 0.02) scheduleSfx(ctx, cue.kind, ctx.currentTime + (cue.at - t) + 0.05, bus);
      }
    },
    [video, audio, stopSfx],
  );

  const seekSource = useCallback(
    (time: number) => {
      if (!video) return;
      if (playing) pause();
      setVideoTime(video, time);
      setSourceTime(time);
    },
    [video, playing, pause],
  );

  const seekRel = useCallback(
    (rel: number) => {
      const current = clipRef.current;
      if (current) seekSource(current.start + rel);
    },
    [seekSource],
  );

  const previewSfx = useCallback(
    (kind: SfxKind) => {
      const ctx = audio();
      scheduleSfx(ctx, kind, ctx.currentTime + 0.02, ctx.destination);
    },
    [audio],
  );

  // 재생 중에는 매 화면마다 시간을 갱신하고, 클립 끝에 닿으면 멈춘다.
  useEffect(() => {
    if (!playing || !video) return;
    let raf = 0;
    const tick = () => {
      const current = clipRef.current;
      setSourceTime(video.currentTime);
      if (current && (video.currentTime >= current.end || video.ended)) {
        pause();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, video, pause]);

  useEffect(() => {
    if (!video) return;
    const redraw = () => {
      setSourceTime(video.currentTime);
      setFrame((f) => f + 1);
    };
    const paused = () => {
      stopSfx();
      setPlaying(false);
    };
    video.addEventListener("seeked", redraw);
    video.addEventListener("loadeddata", redraw);
    video.addEventListener("pause", paused);
    return () => {
      video.removeEventListener("seeked", redraw);
      video.removeEventListener("loadeddata", redraw);
      video.removeEventListener("pause", paused);
    };
  }, [video, stopSfx]);

  // 다른 클립을 고르면 그 클립의 처음으로 간다.
  const clipId = clip?.id;
  useEffect(() => {
    const current = clipRef.current;
    if (!video || !current) return;
    // 멈춤 상태(playing)는 위의 "pause" 이벤트에서 바뀐다.
    video.pause();
    stopSfx();
    setVideoTime(video, current.start);
    // clipId가 바뀔 때만 실행한다.
  }, [clipId, video, stopSfx]);

  useEffect(() => () => void audioRef.current?.close(), []);

  return {
    playing,
    sourceTime,
    rel: sourceTime - (clip?.start ?? 0),
    frame,
    play,
    pause,
    seekRel,
    seekSource,
    previewSfx,
  };
}
