import assert from "node:assert/strict";
import { test } from "node:test";

import { needsQ3, nextQuestion, recommend, totalSteps, type Answers } from "./finder.ts";
import { links, offers } from "./site-content.ts";

// 모든 해결 방법에 주소가 있는 상태. 대안이 주소 때문에 빠지지 않게 해서 결정표만 본다.
const allReady = Object.fromEntries(
  Object.entries(offers).map(([id, offer]) => [id, { ...offer, href: offer.href || `/${id}` }]),
) as typeof offers;

test("고민 찾기: 결정표대로 1순위와 대안을 고른다", () => {
  const cases: [Answers, string, string | null][] = [
    [{ q1: "NO_RESULTS", q2: "WHAT_IS_WRONG" }, "diagnosis", "freeTemplate"],
    [{ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP", q3: "YES" }, "challenge", "feedback"],
    [{ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP", q3: "BUSY" }, "agency", "feedback"],
    [{ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP", q3: "STUCK" }, "vod", "newsletter"],
    [{ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP", q3: "LATER" }, "challenge", "feedback"],
    [{ q1: "NO_RESULTS", q2: "NO_TIME" }, "agency", "diagnosis"],
    [{ q1: "NEW_BEGINNER", q2: "LEARN_SELF" }, "vod", "freeTemplate"],
    [{ q1: "NEW_BEGINNER", q2: "NO_TIME" }, "agency", "freeTemplate"],
    [{ q1: "EXECUTION_BLOCK", q2: "HAS_EXPERIENCE", q3: "YES" }, "challenge", "feedback"],
    [{ q1: "EXECUTION_BLOCK", q2: "HAS_EXPERIENCE", q3: "BUSY" }, "agency", "feedback"],
    [{ q1: "EXECUTION_BLOCK", q2: "HAS_EXPERIENCE", q3: "STUCK" }, "vod", "newsletter"],
    [{ q1: "EXECUTION_BLOCK", q2: "HAS_EXPERIENCE", q3: "LATER" }, "challenge", "feedback"],
    [{ q1: "EXECUTION_BLOCK", q2: "NEED_BASICS" }, "vod", "newsletter"],
    [{ q1: "NEED_FEEDBACK", q2: "SPECIFIC_DRAFT" }, "feedback", "challenge"],
    [{ q1: "NEED_FEEDBACK", q2: "WHOLE_BLOG" }, "diagnosis", "freeTemplate"],
    [{ q1: "WANT_DELEGATION", q2: "LOCAL_BUSINESS" }, "agency", "diagnosis"],
    [{ q1: "WANT_DELEGATION", q2: "PROFESSIONAL" }, "agency", "notes"],
    [{ q1: "WANT_DELEGATION", q2: "OTHER" }, "consult", "notes"],
  ];
  for (const [answers, primary, alternative] of cases) {
    const result = recommend(answers, allReady);
    assert.equal(result?.primary, primary, JSON.stringify(answers));
    assert.equal(result?.alternative, alternative, JSON.stringify(answers));
  }
});

test("고민 찾기: 세 번째 질문은 챌린지 후보에게만 묻는다", () => {
  assert.equal(needsQ3({ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP" }), true);
  assert.equal(needsQ3({ q1: "EXECUTION_BLOCK", q2: "HAS_EXPERIENCE" }), true);
  assert.equal(needsQ3({ q1: "NO_RESULTS", q2: "WHAT_IS_WRONG" }), false);
  assert.equal(needsQ3({ q1: "EXECUTION_BLOCK", q2: "NEED_BASICS" }), false);
  assert.equal(totalSteps({ q1: "NO_RESULTS" }), 2);
  assert.equal(totalSteps({ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP" }), 3);
});

test("고민 찾기: 답한 만큼 다음 질문으로 가고, 다 답하면 결과로 간다", () => {
  assert.equal(nextQuestion({}), "q1");
  assert.equal(nextQuestion({ q1: "NEED_FEEDBACK" }), "q2");
  assert.equal(nextQuestion({ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP" }), "q3");
  assert.equal(nextQuestion({ q1: "NEED_FEEDBACK", q2: "WHOLE_BLOG" }), null);
  assert.equal(nextQuestion({ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP", q3: "BUSY" }), null);
});

test("고민 찾기: 일정만 안 맞는 사람에게는 지금 할 수 있는 사람과 다른 이유를 보여 준다", () => {
  const ready = recommend({ q1: "EXECUTION_BLOCK", q2: "HAS_EXPERIENCE", q3: "YES" }, allReady);
  const later = recommend({ q1: "EXECUTION_BLOCK", q2: "HAS_EXPERIENCE", q3: "LATER" }, allReady);
  assert.equal(later?.primary, ready?.primary);
  assert.notEqual(later?.key, ready?.key);
  assert.equal(later?.key, recommend({ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP", q3: "LATER" }, allReady)?.key);
});

test("고민 찾기: 첫 질문과 맞지 않는 두 번째 답은 결과를 내지 않는다", () => {
  const answers: Answers = { q1: "NEW_BEGINNER", q2: "WHAT_IS_WRONG" };
  assert.equal(nextQuestion(answers), "q2");
  assert.equal(recommend(answers, allReady), null);
  assert.equal(recommend({ q1: "NO_RESULTS", q2: "KNOW_FIX_NEED_HELP" }, allReady), null);
});

test("고민 찾기: 주소가 없는 자료는 대안으로 보이지 않는다", () => {
  const noTemplate = { ...allReady, freeTemplate: { ...allReady.freeTemplate, href: "" } };
  assert.equal(recommend({ q1: "NO_RESULTS", q2: "WHAT_IS_WRONG" }, noTemplate)?.alternative, null);
  assert.equal(recommend({ q1: "NO_RESULTS", q2: "WHAT_IS_WRONG" }, noTemplate)?.primary, "diagnosis");
});

test("해결 방법: 모집 전·준비 중인 것은 결제 페이지로 보내지 않는다", () => {
  const salesPages: string[] = [links.diagnosis, links.challengeSales];
  for (const [id, offer] of Object.entries(offers)) {
    if (offer.status === "waitlist" || offer.status === "upcoming") {
      assert.ok(!salesPages.includes(offer.href), `${id} 가 결제 페이지로 간다`);
    }
  }
});
