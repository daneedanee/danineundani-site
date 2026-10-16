import assert from "node:assert/strict";
import { test } from "node:test";

import { isDirty } from "./dirty.ts";

const saved = { slug: "a", title: "제목", description: "설명", content_md: "본문", cover_image_url: "", pillar: "", branch: "" };

test("저장한 것과 같으면 깨끗하다", () => {
  assert.equal(isDirty(saved, { ...saved }), false);
});

test("어느 칸이든 바뀌면 저장할 것이 있다", () => {
  for (const key of ["slug", "title", "description", "content_md", "cover_image_url", "pillar", "branch"] as const) {
    assert.equal(isDirty(saved, { ...saved, [key]: `${saved[key]}!` }), true, key);
  }
});

test("본문 끝의 공백 하나도 바뀐 것으로 본다 — 쓰던 글을 잃는 쪽보다 한 번 더 묻는 쪽이 낫다", () => {
  assert.equal(isDirty(saved, { ...saved, content_md: "본문 " }), true);
});
