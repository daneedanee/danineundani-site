import assert from "node:assert/strict";
import { test } from "node:test";

import { notesPagePath, pageRange, parsePageParam, totalPages } from "./paging.ts";

test("totalPages: 글이 없어도 1쪽", () => {
  assert.equal(totalPages(0), 1);
  assert.equal(totalPages(1), 1);
  assert.equal(totalPages(10), 1);
  assert.equal(totalPages(11), 2);
  assert.equal(totalPages(25), 3);
});

test("pageRange: Supabase range 에 넣을 시작·끝", () => {
  assert.deepEqual(pageRange(1), { from: 0, to: 9 });
  assert.deepEqual(pageRange(3), { from: 20, to: 29 });
});

test("parsePageParam: 1 이상의 정수만 받는다", () => {
  assert.equal(parsePageParam("1"), 1);
  assert.equal(parsePageParam("12"), 12);
});

test("parsePageParam: 이상한 값은 null", () => {
  for (const bad of ["0", "-1", "02", "1e3", "1.5", "abc", "", " 2", "9999999"]) {
    assert.equal(parsePageParam(bad), null, bad);
  }
});

test("notesPagePath: 1쪽은 /notes", () => {
  assert.equal(notesPagePath(1), "/notes");
  assert.equal(notesPagePath(2), "/notes/page/2");
});
