import assert from "node:assert/strict";
import { test } from "node:test";

import { parseHours, sinceIso } from "./hours.ts";

test("시간 범위: 24(하루)와 168(7일)만 받는다", () => {
  assert.equal(parseHours("24"), 24);
  assert.equal(parseHours("168"), 168);
});

test("시간 범위: 값이 없으면 24", () => {
  assert.equal(parseHours(null), 24);
});

test("시간 범위: 그 밖의 값은 받지 않는다 — 아무 범위나 캐묻지 못하게", () => {
  for (const bad of ["", "0", "1", "25", "720", "abc", "24h", " 24", "-24", "1e2"]) {
    assert.equal(parseHours(bad), null, bad);
  }
});

test("기준 시각: 지금에서 그 시간만큼 앞", () => {
  assert.equal(sinceIso(24, new Date("2026-10-12T00:00:00Z")), "2026-10-11T00:00:00.000Z");
  assert.equal(sinceIso(168, new Date("2026-10-12T00:00:00Z")), "2026-10-05T00:00:00.000Z");
});
