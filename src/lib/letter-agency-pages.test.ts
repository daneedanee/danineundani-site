// 다니레터·블로그 대행 설명 페이지 (2026-10-26 대표 「그안에 각각의 설명 페이지를 넣고, 거기에 링크를 넣는게」):
// 설명은 홈페이지 톤으로 보여 주고, 신청만 바깥 도구(스티비 구독 폼, 네이버 폼)로 한다.
import assert from "node:assert/strict";
import test from "node:test";

import { agencyPage, letterPage, links } from "./site-content.ts";

const 글자들 = (x: unknown): string[] =>
  typeof x === "string" ? [x] : Array.isArray(x) ? x.flatMap(글자들) : x && typeof x === "object" ? Object.values(x).flatMap(글자들) : [];

test("다니레터: 스티비 공식 설치 코드의 주소로 보내고, 개인정보(필수)·광고성 정보(선택) 동의를 둘 다 받는다", () => {
  assert.match(letterPage.form.action, /^https:\/\/stibee\.com\/api\/v1\.0\/lists\/[^/]+\/public\/subscribers$/);
  assert.equal(letterPage.form.policy.required, true);
  assert.equal(letterPage.form.ad.required, false, "광고성 정보 수신은 선택이어야 5일 뒤 진단 안내 메일 기준과 맞다");
  assert.ok(letterPage.form.submit.trim());
});

test("다니레터: 구독하면 받는 것 세 가지 - 워크북, 매주 월요일 레터, 새 소식", () => {
  assert.equal(letterPage.benefits.items.length, 3);
  assert.match(letterPage.benefits.items[0].title, /워크북/);
  assert.match(letterPage.benefits.items[1].title, /월요일/);
});

test("블로그 대행: 신청은 네이버 폼(새 탭), 진행 순서 네 단계, 소수 업체 안내", () => {
  assert.equal(agencyPage.hero.ctaHref, links.agencyFormDirect);
  assert.equal(agencyPage.process.steps.length, 4);
  assert.match(agencyPage.note, /소수 업체/);
});

test("두 페이지 모두 긴 줄표와 결과 보장 말을 쓰지 않는다", () => {
  for (const 말 of [...글자들(letterPage), ...글자들(agencyPage)]) {
    assert.ok(!말.includes("—"), 말);
    assert.ok(!/(최고|1위|유일|100%|무조건|완벽|최저가)/.test(말), 말);
  }
});

test("다니레터 첫 화면: C안 - 다니레터가 먼저, 워크북은 첫 메일로", () => {
  assert.deepEqual(letterPage.hero.titleLines, ["블로그로 문의를 만드는 이야기,", "다니가 매주 편지로 보내 드려요"]);
  assert.match(letterPage.hero.description, /레터에서만 나눠요/);
  assert.equal(letterPage.hero.formTitle, "첫 메일로 워크북을 보내 드려요");
});
