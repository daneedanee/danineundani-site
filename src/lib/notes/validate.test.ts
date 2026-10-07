import assert from "node:assert/strict";
import { test } from "node:test";

import { validatePost } from "./validate.ts";

const good = {
  slug: "blog-seo",
  title: "제목",
  description: "설명입니다.",
  content_md: "본문",
  cover_image_url: "",
};

test("빠진 데 없으면 문제 없음", () => {
  assert.deepEqual(validatePost(good, "publish"), []);
  assert.deepEqual(validatePost(good, "draft"), []);
});

test("초안은 설명과 본문이 비어도 된다", () => {
  assert.deepEqual(validatePost({ ...good, description: "", content_md: "" }, "draft"), []);
});

test("발행은 설명과 본문이 있어야 한다", () => {
  assert.deepEqual(validatePost({ ...good, description: " ", content_md: "" }, "publish"), [
    "발행하려면 설명을 적어 주세요. 검색 결과에 나오는 문장입니다.",
    "발행하려면 본문을 적어 주세요.",
  ]);
});

test("제목은 언제나 있어야 하고 120자를 넘지 않는다", () => {
  assert.deepEqual(validatePost({ ...good, title: "  " }, "draft"), ["제목을 적어 주세요."]);
  assert.deepEqual(validatePost({ ...good, title: "가".repeat(121) }, "draft"), ["제목은 120자까지 쓸 수 있습니다."]);
});

test("주소가 꼴에 맞지 않으면 안내", () => {
  assert.deepEqual(validatePost({ ...good, slug: "Hello World" }, "draft"), [
    "주소는 영문 소문자·숫자·한글과 - 만 쓸 수 있습니다. 예: blog-seo-2026",
  ]);
});

test("설명은 200자를 넘지 않는다", () => {
  assert.deepEqual(validatePost({ ...good, description: "가".repeat(201) }, "draft"), ["설명은 200자까지 쓸 수 있습니다."]);
});

test("대표 이미지는 https 주소만", () => {
  assert.deepEqual(validatePost({ ...good, cover_image_url: "http://x/a.png" }, "draft"), [
    "대표 이미지 주소는 https:// 로 시작해야 합니다.",
  ]);
  assert.deepEqual(validatePost({ ...good, cover_image_url: "https://x/a.png" }, "draft"), []);
});
