// 쇼츠 디자인 양식.
// 새 양식을 만들거나 색·크기를 바꾸려면 이 파일의 templates 목록만 고치면 된다.
// 화면 크기는 1080×1920(세로 9:16) 기준 픽셀이다.
//
// 글자 강조: 문구 안에서 *별표*로 감싼 부분은 accent 색으로 칠해진다.
//   예) "월 매출 *3배* 오른 비결"

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

export type FontRole = "display" | "body";

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
  maxLines: number;
  /** 글자 묶음을 세로로 어디에 붙일지. top이면 y가 첫 줄 위, bottom이면 y가 마지막 줄 아래 */
  anchor: "top" | "bottom";
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
  /** 1이면 영상 칸을 빈틈없이 채움. 클수록 확대된다. 클립마다 따로 바꿀 수 있다. */
  videoZoom: number;
  header: TextStyle;
  bottom: TextStyle;
  subtitle: TextStyle;
};

const CORAL = "#fd715b";

export const templates: Template[] = [
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
