import assert from "node:assert/strict";
import { test } from "node:test";

import { pickRelated } from "./related.ts";
import type { PostSummary } from "./types";

const p = (slug: string, pillar: string | null, branch: string | null, published_at: string) =>
  ({ slug, title: slug, description: "", cover_image_url: null, published_at, pillar, branch }) as PostSummary;

test("같은 가지를 먼저, 그다음 같은 기둥, 자기 자신은 빼고, limit 까지", () => {
  const me = { slug: "me", pillar: "blog-marketing", branch: "진단" } as const;
  const got = pickRelated(me, [
    p("me", "blog-marketing", "진단", "2026-10-10"),
    p("a", "blog-marketing", "세팅", "2026-10-09"),
    p("b", "blog-marketing", "진단", "2026-10-01"),
    p("c", "blog-marketing", null, "2026-10-08"),
    p("d", "blog-marketing", "진단", "2026-10-05"),
  ], 3);
  assert.deepEqual(got.map((x) => x.slug), ["d", "b", "a"]);
});

test("기둥이 없는 글은 관련 글이 없다", () => {
  assert.deepEqual(pickRelated({ slug: "x", pillar: null, branch: null }, [p("a", "blog-marketing", null, "2026-10-01")]), []);
});

test("후보가 없으면 빈 목록", () => {
  assert.deepEqual(pickRelated({ slug: "x", pillar: "blog-marketing", branch: "진단" }, []), []);
});
