// 문장마다 줄바꿈 (2026-10-26 대표 「홈페이지 내에서 문장이 바뀌는 곳에서는 반드시 엔터를 넣어서 줄바꿈을 해줘」).
import assert from "node:assert/strict";
import test from "node:test";

import { splitSentences } from "./sentences.ts";

test("마침표·물음표·느낌표 뒤 띄어쓰기에서 문장을 나눈다", () => {
  assert.deepEqual(splitSentences("블로그와 유튜브에는 다 담지 못한 이야기를 레터에서만 나눠요. 고객사 블로그를 직접 운영합니다."), [
    "블로그와 유튜브에는 다 담지 못한 이야기를 레터에서만 나눠요.",
    "고객사 블로그를 직접 운영합니다.",
  ]);
  assert.deepEqual(splitSentences("정말인가요? 네!! 맞아요."), ["정말인가요?", "네!!", "맞아요."]);
});

test("괄호·따옴표로 끝난 문장도 나누고, 따옴표는 문장에 붙여 둔다", () => {
  assert.deepEqual(splitSentences("이름은 가렸습니다(업종만). 개인의 경험입니다."), ["이름은 가렸습니다(업종만).", "개인의 경험입니다."]);
  assert.deepEqual(splitSentences("\"감사합니다.\" 그래서 시작했어요."), ["\"감사합니다.\"", "그래서 시작했어요."]);
});

test("문장 끝이 아닌 점은 나누지 않는다 - Q. 질문, 번호, 소수점, 주소, 날짜", () => {
  for (const 그대로 of ["Q. 저품질인지도 알 수 있나요?", "1. 첫 단계입니다.", "후기 4.8점", "www.daneedanee.com 에서", "2026. 10. 26 기준"]) {
    assert.deepEqual(splitSentences(그대로), [그대로], 그대로);
  }
});

test("한 문장이거나 빈 글은 그대로 한 줄", () => {
  assert.deepEqual(splitSentences("다니레터 구독하기"), ["다니레터 구독하기"]);
  assert.deepEqual(splitSentences(""), [""]);
  assert.deepEqual(splitSentences("  앞뒤 공백.  "), ["앞뒤 공백."]);
});

test("이미 들어 있는 줄바꿈은 지킨다", () => {
  assert.deepEqual(splitSentences("첫 줄\n둘째 줄. 셋째 문장."), ["첫 줄", "둘째 줄.", "셋째 문장."]);
});

test("굵게 표시(**) 뒤에서도 나눈다", () => {
  assert.deepEqual(splitSentences("앞 문장입니다. **굵은 문장입니다.** 뒤 문장."), ["앞 문장입니다.", "**굵은 문장입니다.**", "뒤 문장."]);
});
