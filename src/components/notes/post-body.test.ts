import assert from "node:assert/strict";
import { test } from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PostBody } from "./post-body.ts";

function render(markdown: string): string {
  return renderToStaticMarkup(createElement(PostBody, { markdown }));
}

test("바깥은 note-body 로 감싼다", () => {
  assert.match(render("글"), /^<div class="note-body"><p>글<\/p><\/div>$/);
});

test("본문의 # 제목은 h2 로 내린다 — h1 은 글 제목 하나뿐이어야 한다", () => {
  const html = render("# 큰 제목\n\n## 작은 제목");
  assert.equal(html.includes("<h1"), false);
  assert.equal((html.match(/<h2>/g) ?? []).length, 2);
});

test("script 태그는 실행되는 꼴로 나가지 않는다", () => {
  const html = render("앞\n\n<script>alert(1)</script>\n\n뒤");
  assert.equal(html.includes("<script"), false);
});

test("javascript: 링크는 지운다", () => {
  const html = render("[누르세요](javascript:alert(1))");
  assert.equal(html.includes("javascript:"), false);
});

test("바깥 링크는 새 탭으로, 안쪽 링크는 그대로", () => {
  const outside = render("[밖](https://example.com)");
  assert.match(outside, /<a href="https:\/\/example\.com" target="_blank" rel="noopener noreferrer">밖<\/a>/);
  const inside = render("[안](/notes)");
  assert.match(inside, /<a href="\/notes">안<\/a>/);
});

test("이미지는 늦게 불러오고 설명을 지킨다", () => {
  const html = render("![가게 앞 사진](https://x.example/a.png)");
  assert.match(html, /<img src="https:\/\/x\.example\/a\.png" alt="가게 앞 사진" loading="lazy" decoding="async"\/>/);
});

test("설명 없는 이미지는 빈 alt 를 준다", () => {
  assert.match(render("![](https://x.example/a.png)"), /alt=""/);
});

test("표(GFM)를 그린다", () => {
  const html = render("| 가 | 나 |\n|---|---|\n| 1 | 2 |");
  assert.equal(html.includes("<table>"), true);
});
