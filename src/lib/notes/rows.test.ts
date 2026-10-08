import assert from "node:assert/strict";
import { test } from "node:test";

import { countOrThrow, rowsOrThrow } from "./rows.ts";

test("줄이 있으면 그대로 돌려준다", () => {
  assert.deepEqual(rowsOrThrow({ data: [{ a: 1 }], error: null }, "글 목록"), [{ a: 1 }]);
});

test("줄이 없으면 빈 목록", () => {
  assert.deepEqual(rowsOrThrow({ data: [], error: null }, "글 목록"), []);
});

test("오류 없이 data 가 null 이어도 던진다 — 수만 묻는 요청에서 실제로 겪은 꼴", () => {
  assert.throws(() => rowsOrThrow({ data: null, error: null }, "글 목록"), /글 목록을 읽지 못했습니다: 응답에 줄이 없습니다/);
});

test("오류가 있으면 던진다 — 빈 목록으로 바꾸면 '글 없음'이 저장돼 버린다", () => {
  assert.throws(
    () => rowsOrThrow({ data: null, error: { message: "relation does not exist" } }, "글 목록"),
    /글 목록을 읽지 못했습니다: relation does not exist/,
  );
});

test("countOrThrow: 수가 있으면 그대로", () => {
  assert.equal(countOrThrow({ count: 0, error: null }, "글 수"), 0);
  assert.equal(countOrThrow({ count: 12, error: null }, "글 수"), 12);
});

test("countOrThrow: 오류가 있으면 던진다", () => {
  assert.throws(() => countOrThrow({ count: null, error: { message: "boom" } }, "글 수"), /글 수를 읽지 못했습니다: boom/);
});

test("countOrThrow: 오류 없이 수가 null 이어도 던진다 — 표가 없을 때 HEAD 요청이 이렇게 돌아온다", () => {
  assert.throws(() => countOrThrow({ count: null, error: null }, "글 수"), /글 수를 읽지 못했습니다: 응답에 수가 없습니다/);
});
