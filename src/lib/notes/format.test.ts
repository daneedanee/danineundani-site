import assert from "node:assert/strict";
import { test } from "node:test";

import { formatDate } from "./format.ts";

test("formatDate: 한국 시간 기준 날짜", () => {
  assert.equal(formatDate("2026-10-07T01:00:00Z"), "2026년 10월 7일");
});

test("formatDate: UTC 로는 전날이어도 한국 날짜를 쓴다", () => {
  assert.equal(formatDate("2026-10-06T15:30:00Z"), "2026년 10월 7일");
});
