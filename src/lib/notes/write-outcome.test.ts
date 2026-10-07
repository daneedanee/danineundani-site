import assert from "node:assert/strict";
import { test } from "node:test";

import { writeOutcome } from "./write-outcome.ts";

test("오류 없이 한 줄 이상 바뀌면 성공", () => {
  assert.deepEqual(writeOutcome({ error: null, rows: 1 }), { ok: true });
});

test("오류 없이 0줄이면 실패다 — RLS 가 조용히 막은 것", () => {
  assert.deepEqual(writeOutcome({ error: null, rows: 0 }), {
    ok: false,
    message: "관리자만 쓸 수 있습니다. 관리자 계정으로 다시 로그인해 주세요.",
  });
});

test("주소가 겹치면 안내", () => {
  assert.deepEqual(writeOutcome({ error: { code: "23505", message: "duplicate key" }, rows: 0 }), {
    ok: false,
    message: "이미 쓰는 주소입니다. 주소를 바꿔 주세요.",
  });
});

test("발행한 글의 주소를 바꾸려 하면 데이터베이스가 준 안내를 그대로 보여 준다", () => {
  assert.deepEqual(
    writeOutcome({ error: { code: "P0001", message: "발행한 글의 주소는 바꿀 수 없습니다." }, rows: 0 }),
    { ok: false, message: "발행한 글의 주소는 바꿀 수 없습니다." },
  );
});

test("권한 오류", () => {
  assert.deepEqual(writeOutcome({ error: { code: "42501", message: "new row violates row-level security policy" }, rows: 0 }), {
    ok: false,
    message: "관리자만 쓸 수 있습니다. 관리자 계정으로 다시 로그인해 주세요.",
  });
});

test("그 밖의 오류", () => {
  assert.deepEqual(writeOutcome({ error: { message: "network" }, rows: 0 }), {
    ok: false,
    message: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  });
});
