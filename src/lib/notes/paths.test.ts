import assert from "node:assert/strict";
import { test } from "node:test";

import { BLOG_PATH, legacyRedirects, postPath } from "./paths.ts";

test("게시판 주소는 /blog", () => {
  assert.equal(BLOG_PATH, "/blog");
  assert.equal(postPath("a"), "/blog/a");
  assert.equal(postPath("새-글"), "/blog/%EC%83%88-%EA%B8%80");
});

test("옛 주소 /notes 는 같은 자리의 /blog 로 영구 이동한다", () => {
  assert.deepEqual(legacyRedirects(), [
    { source: "/notes", destination: "/blog", permanent: true },
    { source: "/notes/:path*", destination: "/blog/:path*", permanent: true },
  ]);
});
