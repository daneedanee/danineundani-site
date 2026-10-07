import assert from "node:assert/strict";
import { test } from "node:test";

import { rowsOrThrow } from "./rows.ts";

test("줄이 있으면 그대로 돌려준다", () => {
  assert.deepEqual(rowsOrThrow({ data: [{ a: 1 }], error: null }, "글 목록"), [{ a: 1 }]);
});

test("data 가 null 이고 오류가 없으면 빈 목록", () => {
  assert.deepEqual(rowsOrThrow({ data: null, error: null }, "글 목록"), []);
});

test("오류가 있으면 던진다 — 빈 목록으로 바꾸면 '글 없음'이 저장돼 버린다", () => {
  assert.throws(
    () => rowsOrThrow({ data: null, error: { message: "relation does not exist" } }, "글 목록"),
    /글 목록을 읽지 못했습니다: relation does not exist/,
  );
});
