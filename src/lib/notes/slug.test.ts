import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeSlugParam, isValidSlug, slugify } from "./slug.ts";

test("slugify: 한글 제목은 한글 그대로, 공백은 -", () => {
  assert.equal(slugify("블로그 글쓰기, 3가지 방법!"), "블로그-글쓰기-3가지-방법");
});

test("slugify: 영문은 소문자, 여러 공백·밑줄은 - 하나", () => {
  assert.equal(slugify("  Hello   World_Again "), "hello-world-again");
});

test("slugify: 쓸 수 있는 글자가 없으면 빈 문자열", () => {
  assert.equal(slugify("!!! ???"), "");
  assert.equal(slugify(""), "");
});

test("slugify: 60자를 넘으면 자르고 끝의 - 를 뗀다", () => {
  const slug = slugify(`${"가".repeat(59)} 나다`);
  assert.equal(slug.length, 59);
  assert.equal(slug.endsWith("-"), false);
});

test("isValidSlug: 한글 60자까지만 — 더 길면 빌드가 만드는 파일 이름이 255바이트를 넘는다", () => {
  assert.equal(isValidSlug("가".repeat(60)), true);
  assert.equal(isValidSlug("가".repeat(61)), false);
});

test("isValidSlug: 허용하는 꼴", () => {
  assert.equal(isValidSlug("blog-seo-2026"), true);
  assert.equal(isValidSlug("블로그-진단"), true);
});

test("isValidSlug: 거부하는 꼴", () => {
  for (const bad of ["", "Hello", "a b", "-a", "a-", "a--b", "a/b", "a%20b", "page", "topic", "가".repeat(61)]) {
    assert.equal(isValidSlug(bad), false, bad);
  }
});

test("decodeSlugParam: 인코딩된 한글 주소를 푼다", () => {
  assert.equal(decodeSlugParam("%EB%B8%94%EB%A1%9C%EA%B7%B8-%EC%A7%84%EB%8B%A8"), "블로그-진단");
});

test("decodeSlugParam: 이미 풀린 주소도 그대로 받는다", () => {
  assert.equal(decodeSlugParam("블로그-진단"), "블로그-진단");
  assert.equal(decodeSlugParam("blog-seo"), "blog-seo");
});

test("decodeSlugParam: 자모가 풀려 들어온 한글(NFD)을 합친다", () => {
  assert.equal(decodeSlugParam("블로그".normalize("NFD")), "블로그");
});

test("decodeSlugParam: 깨진 인코딩과 허용하지 않는 주소는 null", () => {
  assert.equal(decodeSlugParam("%E0%A4%A"), null);
  assert.equal(decodeSlugParam("Hello"), null);
  assert.equal(decodeSlugParam("a%2Fb"), null);
  assert.equal(decodeSlugParam("page"), null);
});
