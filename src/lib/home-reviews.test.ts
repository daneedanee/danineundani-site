// 홈 후기 구역 (2026-10-26 대표 「진단 3장, 챌린지 3장으로」): 진단 후기 세 장과 블로그 챌린지 1기 후기 세 장을 나눠 보인다.
import assert from "node:assert/strict";
import test from "node:test";

import { diagnosisPage, homeReviews, links, offers } from "./site-content.ts";

test("홈 후기: 진단 세 장과 챌린지 1기 세 장으로 나뉜다", () => {
  assert.deepEqual(
    homeReviews.groups.map((g) => [g.name, g.items.length]),
    [
      ["블로그 진단", 3],
      ["매출로 이어지는 블로그 챌린지 1기", 3],
    ],
  );
});

test("홈 후기: 진단 세 장은 진단 상세페이지 후기에서 그대로 가져온다", () => {
  const 진단 = homeReviews.groups[0].items.map((x) => x.text);
  const 상세 = [...diagnosisPage.reviews.captures.map((x) => x.quote), ...diagnosisPage.reviews.items.map((x) => x.text)];
  for (const 말 of 진단) assert.ok(상세.includes(말), 말);
  assert.equal(homeReviews.groups[0].moreHref, "/diagnosis#diagnosis-reviews");
});

test("홈 후기: 모든 후기에 출처가 있고 긴 줄표가 없다", () => {
  for (const g of homeReviews.groups)
    for (const x of g.items) {
      assert.ok(x.text.trim() && x.source.trim(), x.text);
      assert.ok(!x.text.includes("—") && !x.source.includes("—"), x.text);
    }
  assert.ok(!homeReviews.title.includes("—") && !homeReviews.note.includes("—"));
});

test("홈 후기: 챌린지 링크는 모집 상태를 따른다 - 모집 전에는 결제 페이지로 보내지 않는다", () => {
  const 챌린지 = homeReviews.groups[1];
  assert.equal(챌린지.moreHref, offers.challenge.href);
  if ((offers.challenge.status as string) !== "available") assert.notEqual(챌린지.moreHref, links.challengeSales);
});
