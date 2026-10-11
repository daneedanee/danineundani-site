// 쇼츠 디자인 양식.
// 새 양식을 만들거나 색·크기를 바꾸려면 이 파일의 templates 목록만 고치면 된다.
// 화면 크기는 1080×1920(세로 9:16) 기준 픽셀이다.
//
// 글자 강조: 문구 안에서 *별표*로 감싼 부분은 accent 색으로 칠해진다.
//   예) "월 매출 *3배* 오른 비결"

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

/** display: 굵은 제목 글꼴 / body: 아주 굵은 본문 글꼴 / plain: 보통 굵기 본문 글꼴 */
export type FontRole = "display" | "body" | "plain";

export type TextStyle = {
  font: FontRole;
  /** 글자 크기(px). 줄이 넘치면 자동으로 줄어든다. */
  size: number;
  color: string;
  accent: string;
  /** 글자 테두리. 없으면 테두리 없음 */
  stroke?: { color: string; width: number };
  /** 글자 뒤 상자 배경. 없으면 상자 없음 */
  box?: string;
  /** 상자 모서리 둥글기(px). 기본 18 */
  boxRadius?: number;
  /** 글자 그림자 색. 없으면 그림자 없음 */
  shadow?: string;
  /** 화면 양옆 여백(px). 기본 60 */
  sidePadding?: number;
  /** 글자 사이 간격 (글자 크기 대비, 음수면 좁게). 기본 0 */
  letterSpacing?: number;
  /** 띄어쓰기 폭 배율. 기본 1 */
  spaceScale?: number;
  /** 줄 간격 (글자 크기 대비). 기본 1.28 */
  lineHeight?: number;
  maxLines: number;
  /** 글자 묶음을 세로로 어디에 붙일지. top이면 y가 첫 줄 위, bottom이면 y가 마지막 줄 아래 */
  anchor: "top" | "bottom";
  /** 위치 기준. canvas면 화면 맨 위에서 y, videoBottom이면 보이는 영상 아랫변에서 y (기본 canvas) */
  from?: "canvas" | "videoBottom";
  y: number;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  background: string;
  /** band: 위·아래 띠 사이에 영상 / full: 영상이 화면 전체를 채움 */
  layout: "band" | "full";
  /** band 레이아웃에서 영상이 들어가는 칸 */
  videoBox: { top: number; height: number };
  /**
   * 영상 크기를 정하는 방식.
   * cover(기본): 영상 칸을 빈틈없이 채운다.
   * width: 화면 가로폭에 맞춘 크기를 1로 보고 videoZoom배 한다. 영상은 칸 맨 위에 붙는다.
   */
  videoFit?: "cover" | "width";
  /** 영상 확대 배율의 기준값. 클립마다 이 값에 다시 곱해서 조절한다. */
  videoZoom: number;
  /** 영상 아래쪽을 잘라 낼 비율 기본값 (0~0.4). 화면에 박힌 자막을 가릴 때 쓴다. */
  cropBottom?: number;
  /** 화면 위쪽을 검게 덮는 그라데이션 (제목이 잘 보이게) */
  topShade?: { height: number; opacity: number };
  /** 새 클립을 만들 때 바닥 문구에 미리 넣어 둘 글 */
  defaultBottom?: string;
  header: TextStyle;
  bottom: TextStyle;
  subtitle: TextStyle;
};

const CORAL = "#fd715b";

export const templates: Template[] = [
  {
    // 유튜브 @다니는다니 숏츠 모양 (2026-09-28 대표가 보낸 캡처 기준)
    id: "dani-channel",
    name: "다니 채널 숏츠",
    description: "영상이 화면 전체, 위에 노란 제목 두 줄, 가운데 아래 검정 상자 자막, 맨 아래 '다니는다니 블로그마케팅'.",
    background: "#000000",
    layout: "full",
    videoBox: { top: 0, height: CANVAS_HEIGHT },
    videoZoom: 1,
    topShade: { height: 560, opacity: 0.85 },
    defaultBottom: "다니는다니\n블로그마케팅",
    header: {
      font: "display",
      size: 150,
      color: "#f3ff4f",
      accent: "#ffffff",
      stroke: { color: "#000000", width: 22 },
      sidePadding: 20,
      letterSpacing: -0.05,
      spaceScale: 0.5,
      lineHeight: 1.08,
      maxLines: 2,
      anchor: "top",
      y: 170,
    },
    bottom: {
      font: "display",
      size: 140,
      color: "rgba(255,255,255,0.93)",
      letterSpacing: -0.04,
      spaceScale: 0.5,
      lineHeight: 1.02,
      accent: "#f3ff4f",
      shadow: "rgba(0,0,0,0.45)",
      maxLines: 2,
      anchor: "top",
      y: 1500,
    },
    subtitle: {
      font: "plain",
      size: 60,
      color: "#ffffff",
      accent: "#f3ff4f",
      box: "rgba(0,0,0,0.88)",
      boxRadius: 2,
      maxLines: 2,
      anchor: "bottom",
      y: 1440,
    },
  },
  {
    // 자막이 이미 박힌 가로 미드폼 완성본용 (2026-10-04 대표 작업 방식 기준)
    // 9:16 화면에 영상을 가로폭의 150%로 키워 거의 정사각형으로 넣고, 아래를 잘라 박힌 자막을 가린다.
    // 자막은 SRT로 새로 넣고, 보이는 영상 아랫변에 붙는다.
    id: "dani-midform",
    name: "미드폼 (자막 박힌 완성본)",
    description: "가로 완성본을 150%로 키워 가운데에 넣고 아래를 잘라 박힌 자막을 가린다. 제목·바닥 문구는 채널 숏츠와 같다.",
    background: "#000000",
    layout: "band",
    videoFit: "width",
    videoBox: { top: 520, height: 960 },
    videoZoom: 1.5,
    cropBottom: 0.15,
    defaultBottom: "다니는다니\n블로그마케팅",
    header: {
      font: "display",
      size: 150,
      color: "#f3ff4f",
      accent: "#ffffff",
      stroke: { color: "#000000", width: 22 },
      sidePadding: 20,
      letterSpacing: -0.05,
      spaceScale: 0.5,
      lineHeight: 1.08,
      maxLines: 2,
      anchor: "top",
      y: 170,
    },
    bottom: {
      font: "display",
      size: 140,
      color: "rgba(255,255,255,0.93)",
      accent: "#f3ff4f",
      letterSpacing: -0.04,
      spaceScale: 0.5,
      lineHeight: 1.02,
      maxLines: 2,
      anchor: "top",
      y: 1530,
    },
    subtitle: {
      font: "plain",
      size: 60,
      color: "#ffffff",
      accent: "#f3ff4f",
      box: "rgba(0,0,0,0.88)",
      boxRadius: 2,
      maxLines: 2,
      anchor: "bottom",
      from: "videoBottom",
      y: -36,
    },
  },
  {
    id: "dani-black",
    name: "다니 기본 (검정)",
    description: "검정 바탕, 위에 흰 제목·아래 코랄 문구. 가로 영상을 가운데에 둔다.",
    background: "#0b0b0b",
    layout: "band",
    videoBox: { top: 600, height: 720 },
    videoZoom: 1,
    header: {
      font: "display",
      size: 96,
      color: "#ffffff",
      accent: CORAL,
      maxLines: 2,
      anchor: "bottom",
      y: 560,
    },
    bottom: {
      font: "display",
      size: 64,
      color: CORAL,
      accent: "#ffffff",
      maxLines: 2,
      anchor: "top",
      y: 1380,
    },
    subtitle: {
      font: "body",
      size: 60,
      color: "#ffffff",
      accent: "#ffe14d",
      stroke: { color: "#000000", width: 12 },
      maxLines: 2,
      anchor: "bottom",
      y: 1290,
    },
  },
  {
    id: "dani-full",
    name: "꽉 찬 화면",
    description: "영상이 화면 전체를 채우고, 글자를 영상 위에 얹는다. 인물 한 명이 말하는 영상에 좋다.",
    background: "#000000",
    layout: "full",
    videoBox: { top: 0, height: CANVAS_HEIGHT },
    videoZoom: 1,
    header: {
      font: "display",
      size: 92,
      color: "#ffffff",
      accent: CORAL,
      stroke: { color: "#000000", width: 14 },
      maxLines: 2,
      anchor: "top",
      y: 200,
    },
    bottom: {
      font: "display",
      size: 56,
      color: "#111111",
      accent: CORAL,
      box: "#ffffff",
      maxLines: 1,
      anchor: "top",
      y: 1640,
    },
    subtitle: {
      font: "body",
      size: 64,
      color: "#ffffff",
      accent: "#ffe14d",
      stroke: { color: "#000000", width: 14 },
      maxLines: 2,
      anchor: "bottom",
      y: 1560,
    },
  },
  {
    id: "dani-ivory",
    name: "밝은 카드",
    description: "아이보리 바탕에 검정 제목. 정보 전달형 영상에 어울린다.",
    background: "#fff8f0",
    layout: "band",
    videoBox: { top: 620, height: 680 },
    videoZoom: 1,
    header: {
      font: "display",
      size: 92,
      color: "#111111",
      accent: CORAL,
      maxLines: 2,
      anchor: "bottom",
      y: 570,
    },
    bottom: {
      font: "body",
      size: 54,
      color: "#ffffff",
      accent: "#111111",
      box: CORAL,
      maxLines: 2,
      anchor: "top",
      y: 1380,
    },
    subtitle: {
      font: "body",
      size: 58,
      color: "#ffffff",
      accent: "#ffe14d",
      stroke: { color: "#111111", width: 12 },
      maxLines: 2,
      anchor: "bottom",
      y: 1270,
    },
  },
];

export function findTemplate(id: string): Template {
  return templates.find((t) => t.id === id) ?? templates[0];
}
