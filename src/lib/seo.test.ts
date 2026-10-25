import assert from "node:assert/strict";
import { test } from "node:test";

import { absoluteUrl, isIndexingAllowed, resolveSiteUrl, robotsFor, robotsMeta, sitemapFor } from "./seo.ts";

const base = "https://www.daneedanee.com";

test("사이트 주소: 값이 없으면 대표 주소를 쓴다", () => {
  assert.equal(resolveSiteUrl(undefined), base);
  assert.equal(resolveSiteUrl("  "), base);
});

test("사이트 주소: 끝의 빗금을 뗀다", () => {
  assert.equal(resolveSiteUrl("https://example.com/"), "https://example.com");
});

test("색인 스위치: 정확히 true 일 때만 켜진다", () => {
  assert.equal(isIndexingAllowed("true"), true);
  assert.equal(isIndexingAllowed(" true "), true);
  assert.equal(isIndexingAllowed("TRUE"), false);
  assert.equal(isIndexingAllowed("1"), false);
  assert.equal(isIndexingAllowed(""), false);
  assert.equal(isIndexingAllowed(undefined), false);
});

test("절대 주소: 한글 경로를 인코딩한다", () => {
  assert.equal(absoluteUrl("/", base), "https://www.daneedanee.com/");
  assert.equal(absoluteUrl("/notes", base), "https://www.daneedanee.com/notes");
  assert.equal(absoluteUrl("/notes/블로그", base), "https://www.daneedanee.com/notes/%EB%B8%94%EB%A1%9C%EA%B7%B8");
});

test("robots 메타: 꺼지면 noindex, 켜지면 index", () => {
  assert.deepEqual(robotsMeta(false), { index: false, follow: false });
  assert.deepEqual(robotsMeta(true), { index: true, follow: true });
});

test("robots.txt: 꺼진 동안 크롤링은 막지 않고 사이트맵도 알리지 않는다", () => {
  assert.deepEqual(robotsFor(false, base), { rules: { userAgent: "*", allow: "/" } });
});

test("robots.txt: 켜지면 관리자·API를 막고 사이트맵을 알린다", () => {
  assert.deepEqual(robotsFor(true, base), {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: "https://www.daneedanee.com/sitemap.xml",
  });
});

test("사이트맵: 꺼진 동안 비어 있다", () => {
  assert.deepEqual(sitemapFor(false, [{ slug: "a", updated_at: "2026-10-07T00:00:00Z" }], base), []);
});

test("사이트맵: 켜지면 홈, 진단 상세, 목록, 글이 들어간다", () => {
  const entries = sitemapFor(
    true,
    [
      { slug: "old", updated_at: "2026-10-01T00:00:00Z" },
      { slug: "새-글", updated_at: "2026-10-07T00:00:00Z" },
    ],
    base,
  );
  assert.deepEqual(
    entries.map((e) => e.url),
    [
      "https://www.daneedanee.com/",
      "https://www.daneedanee.com/diagnosis",
      "https://www.daneedanee.com/notes",
      "https://www.daneedanee.com/notes/old",
      "https://www.daneedanee.com/notes/%EC%83%88-%EA%B8%80",
    ],
  );
  // 목록의 수정 시각은 가장 최근 글을 따른다.
  assert.equal((entries[2].lastModified as Date).toISOString(), "2026-10-07T00:00:00.000Z");
  assert.equal((entries[4].lastModified as Date).toISOString(), "2026-10-07T00:00:00.000Z");
});

test("사이트맵: 글이 없어도 홈, 진단 상세, 목록은 들어간다", () => {
  assert.deepEqual(
    sitemapFor(true, [], base).map((e) => e.url),
    ["https://www.daneedanee.com/", "https://www.daneedanee.com/diagnosis", "https://www.daneedanee.com/notes"],
  );
});
