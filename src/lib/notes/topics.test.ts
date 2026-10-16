import assert from "node:assert/strict";
import { test } from "node:test";

import { PILLARS, hubPath, isPillarKey, pillarName } from "./topics.ts";

test("기둥은 둘이고 키와 이름이 정해져 있다", () => {
  assert.deepEqual(
    PILLARS.map((p) => [p.key, p.name]),
    [
      ["blog-marketing", "블로그마케팅"],
      ["small-business-marketing", "자영업자 마케팅"],
    ],
  );
});

test("isPillarKey 는 목록의 키만 받는다", () => {
  assert.equal(isPillarKey("blog-marketing"), true);
  for (const v of ["", "Blog-Marketing", "seo", null, undefined, 3]) assert.equal(isPillarKey(v), false);
});

test("pillarName 은 모르는 키와 null 에 null", () => {
  assert.equal(pillarName("small-business-marketing"), "자영업자 마케팅");
  assert.equal(pillarName("x"), null);
  assert.equal(pillarName(null), null);
});

test("hubPath", () => assert.equal(hubPath("blog-marketing"), "/notes/topic/blog-marketing"));
