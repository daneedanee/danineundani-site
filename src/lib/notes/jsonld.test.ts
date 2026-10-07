import assert from "node:assert/strict";
import { test } from "node:test";

import { blogPostingJsonLd, breadcrumbJsonLd, serializeJsonLd } from "./jsonld.ts";

const site = {
  siteName: "다니는다니",
  siteUrl: "https://www.daneedanee.com/",
  authorName: "다니",
  authorSameAs: ["https://www.youtube.com/@x"],
};

const post = {
  title: "제목",
  description: "설명",
  cover_image_url: "https://img.example/a.png",
  published_at: "2026-10-07T01:00:00Z",
  updated_at: "2026-10-08T02:00:00Z",
};

test("BlogPosting: 필수 항목과 글쓴이(사람)·발행처(조직)", () => {
  const data = blogPostingJsonLd(post, "https://www.daneedanee.com/notes/a", site);
  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "BlogPosting");
  assert.equal(data.headline, "제목");
  assert.equal(data.description, "설명");
  assert.equal(data.datePublished, "2026-10-07T01:00:00Z");
  assert.equal(data.dateModified, "2026-10-08T02:00:00Z");
  assert.deepEqual(data.image, ["https://img.example/a.png"]);
  assert.deepEqual(data.mainEntityOfPage, { "@type": "WebPage", "@id": "https://www.daneedanee.com/notes/a" });
  assert.deepEqual(data.author, { "@type": "Person", name: "다니", sameAs: ["https://www.youtube.com/@x"] });
  assert.deepEqual(data.publisher, { "@type": "Organization", name: "다니는다니", url: "https://www.daneedanee.com/" });
});

test("BlogPosting: 대표 이미지가 없으면 image 를 넣지 않는다", () => {
  const data = blogPostingJsonLd({ ...post, cover_image_url: null }, "https://x/notes/a", site);
  assert.equal("image" in data, false);
});

test("BlogPosting: 발행 시각이 없으면 수정 시각을 쓴다", () => {
  const data = blogPostingJsonLd({ ...post, published_at: null }, "https://x/notes/a", site);
  assert.equal(data.datePublished, "2026-10-08T02:00:00Z");
});

test("BreadcrumbList: 순서대로 번호를 매긴다", () => {
  const data = breadcrumbJsonLd([
    { name: "홈", url: "https://x/" },
    { name: "글", url: "https://x/notes" },
  ]);
  assert.equal(data["@type"], "BreadcrumbList");
  assert.deepEqual(data.itemListElement, [
    { "@type": "ListItem", position: 1, name: "홈", item: "https://x/" },
    { "@type": "ListItem", position: 2, name: "글", item: "https://x/notes" },
  ]);
});

test("serializeJsonLd: 제목에 </script> 가 있어도 태그가 닫히지 않는다", () => {
  const text = serializeJsonLd({ headline: "</script><script>alert(1)</script>" });
  assert.equal(text.includes("<"), false);
  assert.deepEqual(JSON.parse(text), { headline: "</script><script>alert(1)</script>" });
});
