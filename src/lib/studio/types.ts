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

/** 원본 영상에서 잘라 올 한 컷 (원본 기준 시작·끝) */
export type Segment = { start: number; end: number };

export type Clip = {
  id: string;
  /** 원본 영상 기준 시작·끝 시간. 컷이 여러 개면 첫 컷의 시작과 마지막 컷의 끝 */
  start: number;
  end: number;
  /**
   * 이어붙일 컷 목록 (순서대로 재생). 없으면 start~end 한 컷.
   * 자막·효과음 시간은 컷을 이어붙인 뒤의 시간(클립 시작 = 0)이다.
   */
  segments?: Segment[];
  /** 0~100. 자동 선별 점수. 직접 추가한 클립은 null */
  score: number | null;
  /** 가장 크게 터진 순간 (원본 기준) */
  peak: number | null;
  /** 대본으로 고른 클립일 때: hook(후킹) / core(핵심) */
  kind?: "hook" | "core";
  /** 대본으로 고른 클립일 때: 고른 이유 */
  note?: string;
  title: string;
  bottom: string;
  /** 영상 확대 배율 (1 = 칸을 빈틈없이 채움) */
  zoom: number;
  /** 잘릴 때 어디를 보여줄지. 0 = 왼쪽, 0.5 = 가운데, 1 = 오른쪽 */
  focusX: number;
  /** 영상 아래쪽을 잘라 낼 비율 (0~0.4). 화면에 박힌 자막을 가릴 때 쓴다. 없으면 양식 기본값 */
  cropBottom?: number;
  /** 자막을 양식 기본 위치에서 위(-)·아래(+)로 옮길 거리(px). 없으면 0 */
  subtitleY?: number;
  subtitles: Subtitle[];
  sfx: SfxCue[];
};

/** 소리 크기 흐름. hop 초마다 한 칸씩, 각 칸은 dB 값이다. */
export type Envelope = {
  hop: number;
  db: Float32Array;
  duration: number;
};
