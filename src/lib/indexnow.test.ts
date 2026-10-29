import { test } from "node:test";
import assert from "node:assert/strict";

import { readFileSync } from "node:fs";

import { INDEXNOW_ENDPOINT, INDEXNOW_KEY, changedUrls, indexNowBody, notifyIndexNow } from "./indexnow.ts";

const base = "https://www.daneedanee.com";
const now = new Date("2026-10-29T12:00:00Z");

test("IndexNow 키: 규칙에 맞고 public 의 키 파일 내용과 같다", () => {
  assert.match(INDEXNOW_KEY, /^[a-zA-Z0-9-]{8,128}$/);
  const file = readFileSync(new URL(`../../public/${INDEXNOW_KEY}.txt`, import.meta.url), "utf8");
  assert.equal(file.trim(), INDEXNOW_KEY);
});

test("IndexNow 받는 곳: 네이버 서치어드바이저", () => {
  assert.equal(INDEXNOW_ENDPOINT, "https://searchadvisor.naver.com/indexnow");
});

test("바뀐 주소: 10분 안에 고친 발행 글과 블로그 목록, 그 글의 주제 모음만 고른다", () => {
  const urls = changedUrls(
    [
      { slug: "방금-글", updated_at: "2026-10-29T11:58:00Z", pillar: "blog-marketing" },
      { slug: "fresh", updated_at: "2026-10-29T11:51:00Z", pillar: null },
      { slug: "old", updated_at: "2026-10-29T11:49:00Z", pillar: "small-business-marketing" },
    ],
    now,
    base,
  );
  assert.deepEqual(urls, [
    "https://www.daneedanee.com/blog/%EB%B0%A9%EA%B8%88-%EA%B8%80",
    "https://www.daneedanee.com/blog/fresh",
    "https://www.daneedanee.com/blog",
    "https://www.daneedanee.com/blog/topic/blog-marketing",
  ]);
});

test("바뀐 주소: 같은 주제 글이 둘이어도 주제 모음은 한 번만 넣는다", () => {
  const urls = changedUrls(
    [
      { slug: "a", updated_at: "2026-10-29T11:59:00Z", pillar: "blog-marketing" },
      { slug: "b", updated_at: "2026-10-29T11:59:30Z", pillar: "blog-marketing" },
    ],
    now,
    base,
  );
  assert.equal(urls.filter((u) => u.endsWith("/blog/topic/blog-marketing")).length, 1);
});

test("바뀐 주소: 최근에 고친 글이 없으면 아무것도 보내지 않는다", () => {
  assert.deepEqual(changedUrls([{ slug: "old", updated_at: "2026-10-28T00:00:00Z", pillar: null }], now, base), []);
  assert.deepEqual(changedUrls([], now, base), []);
});

test("보내는 내용: 도메인, 키, 키 파일 주소, 주소 목록", () => {
  assert.deepEqual(indexNowBody(["https://www.daneedanee.com/blog/a"], base, "abcd1234"), {
    host: "www.daneedanee.com",
    key: "abcd1234",
    keyLocation: "https://www.daneedanee.com/abcd1234.txt",
    urlList: ["https://www.daneedanee.com/blog/a"],
  });
});

test("알리기: 주소가 있으면 네이버에 JSON 으로 한 번 보내고 응답 코드를 돌려준다", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fakeFetch = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(null, { status: 202 });
  };
  const result = await notifyIndexNow(["https://www.daneedanee.com/blog/a"], fakeFetch, base, "abcd1234");
  assert.deepEqual(result, { sent: 1, status: 202 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://searchadvisor.naver.com/indexnow");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(new Headers(calls[0].init.headers).get("content-type"), "application/json; charset=utf-8");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)).urlList, ["https://www.daneedanee.com/blog/a"]);
});

test("알리기: 주소가 없으면 보내지 않는다", async () => {
  let called = false;
  const fakeFetch = async () => {
    called = true;
    return new Response(null, { status: 200 });
  };
  assert.deepEqual(await notifyIndexNow([], fakeFetch, base, "abcd1234"), { sent: 0, status: null });
  assert.equal(called, false);
});
