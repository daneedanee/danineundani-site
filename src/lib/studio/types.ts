// 쇼츠 편집 툴(/studio)에서 쓰는 자료 모양.
// 시간 단위는 모두 초(second)다. 자막·효과음 시간은 "클립 시작점으로부터"의 시간이다.

export type SfxKind = "ding" | "pop" | "whoosh" | "boom" | "sparkle";

export type Subtitle = {
  id: string;
  start: number;
  end: number;
  text: string;
};

export type SfxCue = {
  id: string;
  at: number;
  kind: SfxKind;
};

export type Clip = {
  id: string;
  /** 원본 영상 기준 시작·끝 시간 */
  start: number;
  end: number;
  /** 0~100. 자동 선별 점수. 직접 추가한 클립은 null */
  score: number | null;
  /** 가장 크게 터진 순간 (원본 기준) */
  peak: number | null;
  title: string;
  bottom: string;
  /** 영상 확대 배율 (1 = 칸을 빈틈없이 채움) */
  zoom: number;
  /** 잘릴 때 어디를 보여줄지. 0 = 왼쪽, 0.5 = 가운데, 1 = 오른쪽 */
  focusX: number;
  subtitles: Subtitle[];
  sfx: SfxCue[];
};

/** 소리 크기 흐름. hop 초마다 한 칸씩, 각 칸은 dB 값이다. */
export type Envelope = {
  hop: number;
  db: Float32Array;
  duration: number;
};
