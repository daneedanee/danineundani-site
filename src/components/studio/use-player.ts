"use client";

// 미리보기 재생 조작. 원본 <video>를 클립 구간 안에서만 재생하고, 효과음을 맞춰 튼다.
import { useCallback, useEffect, useRef, useState } from "react";

import { clipDuration, clipSegments, relToSource, segmentOffsets, sourceToRel } from "@/lib/studio/segments";
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
  /** 지금 재생 중인 컷 번호 */
  const segmentRef = useRef(0);

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

  /** 클립 시간 fromRel부터 index번 컷이 끝날 때까지 들어 있는 효과음을 예약한다. (컷을 넘어갈 때마다 다시 부른다) */
  const scheduleSegmentSfx = useCallback(
    (fromRel: number, index: number) => {
      const current = clipRef.current;
      if (!current) return;
      const ctx = audio();
      if (!sfxBusRef.current) {
        const bus = ctx.createGain();
        bus.connect(ctx.destination);
        sfxBusRef.current = bus;
      }
      const segments = clipSegments(current);
      const offsets = segmentOffsets(segments);
      const segEnd = offsets[index] + (segments[index].end - segments[index].start);
      for (const cue of current.sfx) {
        if (cue.at >= fromRel - 0.02 && cue.at < segEnd) {
          scheduleSfx(ctx, cue.kind, ctx.currentTime + (cue.at - fromRel) + 0.05, sfxBusRef.current);
        }
      }
    },
    [audio],
  );

  const play = useCallback(
    (fromRel?: number) => {
      const current = clipRef.current;
      if (!video || !current) return;
      const length = clipDuration(current);
      let t = fromRel ?? sourceToRel(current, video.currentTime);
      if (t < 0 || t >= length - 0.05) t = 0;
      const { time, index } = relToSource(current, t);
      segmentRef.current = index;
      setVideoTime(video, time);
      void video.play();
      setPlaying(true);

      stopSfx();
      scheduleSegmentSfx(t, index);
    },
    [video, stopSfx, scheduleSegmentSfx],
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
      if (current) seekSource(relToSource(current, rel).time);
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

  // 재생 중에는 매 화면마다 시간을 갱신한다. 컷 끝에 닿으면 다음 컷으로 넘어가고, 마지막 컷이 끝나면 멈춘다.
  useEffect(() => {
    if (!playing || !video) return;
    let raf = 0;
    const tick = () => {
      const current = clipRef.current;
      if (current) {
        const segments = clipSegments(current);
        const index = Math.min(segmentRef.current, segments.length - 1);
        if (video.currentTime >= segments[index].end || video.ended) {
          if (index + 1 < segments.length && !video.ended) {
            segmentRef.current = index + 1;
            setVideoTime(video, segments[index + 1].start);
            scheduleSegmentSfx(segmentOffsets(segments)[index + 1], index + 1);
          } else {
            pause();
            return;
          }
        }
      }
      setSourceTime(video.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, video, pause, scheduleSegmentSfx]);

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
    segmentRef.current = 0;
    setVideoTime(video, clipSegments(current)[0].start);
    // clipId가 바뀔 때만 실행한다.
  }, [clipId, video, stopSfx]);

  useEffect(() => () => void audioRef.current?.close(), []);

  return {
    playing,
    sourceTime,
    rel: clip ? sourceToRel(clip, sourceTime) : 0,
    frame,
    play,
    pause,
    seekRel,
    seekSource,
    previewSfx,
  };
}
