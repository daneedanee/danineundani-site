import assert from "node:assert/strict";
import { test } from "node:test";

import { longVideosFeedUrl, parseVideoFeed } from "./youtube.ts";

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">
 <title>Videos</title>
 <entry>
  <id>yt:video:aaaaaaaaaaa</id>
  <yt:videoId>aaaaaaaaaaa</yt:videoId>
  <title>&quot;아직도 블로그 먹히나요?&quot; 글 100개 &amp; 문의 0</title>
  <published>2026-10-02T09:00:00+00:00</published>
 </entry>
 <entry>
  <yt:videoId>bbbbbbbbbbb</yt:videoId>
  <title>둘째 영상</title>
  <published>2026-09-23T09:00:00+00:00</published>
 </entry>
</feed>`;

test("일반 영상만 주는 재생목록 주소: 채널 ID 의 UC 를 UULF 로 바꾼다", () => {
  assert.equal(
    longVideosFeedUrl("UCHswvf6WXV6ftP8WqpHNUnA"),
    "https://www.youtube.com/feeds/videos.xml?playlist_id=UULFHswvf6WXV6ftP8WqpHNUnA",
  );
});

test("피드에서 영상 ID · 제목 · 올린 날을 순서대로 꺼낸다", () => {
  assert.deepEqual(parseVideoFeed(feed), [
    { id: "aaaaaaaaaaa", title: '"아직도 블로그 먹히나요?" 글 100개 & 문의 0', published: "2026-10-02T09:00:00+00:00" },
    { id: "bbbbbbbbbbb", title: "둘째 영상", published: "2026-09-23T09:00:00+00:00" },
  ]);
});

test("영상 ID 꼴이 아닌 항목은 버린다 — 그 값이 주소와 이미지 경로에 그대로 들어간다", () => {
  const bad = feed.replace("bbbbbbbbbbb", 'x"onerror="1');
  assert.deepEqual(
    parseVideoFeed(bad).map((v) => v.id),
    ["aaaaaaaaaaa"],
  );
});

test("피드가 아니거나 비어 있으면 빈 목록", () => {
  assert.deepEqual(parseVideoFeed(""), []);
  assert.deepEqual(parseVideoFeed("<html>오류</html>"), []);
});
