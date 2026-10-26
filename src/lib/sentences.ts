// 문장마다 줄을 나눈다 (2026-10-26 대표 「홈페이지 내에서 문장이 바뀌는 곳에서는 반드시 엔터를 넣어서 줄바꿈을 해줘」).
// 한글이나 닫는 괄호 바로 뒤의 . ! ? (그 뒤 닫는 따옴표까지) 다음 띄어쓰기에서만 나눈다.
// 그래서 "Q. 질문", "1. 단계", 소수점·주소·날짜의 점에서는 나누지 않는다. 글에 이미 있는 줄바꿈은 지킨다.
const 경계 = /(?<=[가-힣)\]][.!?]+["'”’)*]*)\s+/u;

export function splitSentences(text: string): string[] {
  const 줄들 = text
    .split("\n")
    .flatMap((줄) => 줄.trim().split(경계))
    .map((문장) => 문장.trim());
  const 남은 = 줄들.filter((문장) => 문장.length > 0);
  return 남은.length ? 남은 : [""];
}
