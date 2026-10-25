import assert from "node:assert/strict";
import { test } from "node:test";

import { validateInquiry } from "./validate.ts";

const ok = { name: "다니", email: "test@example.com", message: "블로그 문의가 줄었어요", consent: true };

test("모두 채우고 동의하면 오류가 없다", () => {
  assert.deepEqual(validateInquiry(ok), {});
});

test("개인정보 수집·이용에 동의하지 않으면 신청할 수 없다 (2026-10-26 필수 동의)", () => {
  assert.deepEqual(validateInquiry({ ...ok, consent: false }), { consent: "개인정보 수집·이용에 동의해 주세요." });
});

test("이름·이메일·상담 내용 규칙은 그대로다", () => {
  const errors = validateInquiry({ name: " ", email: "nope", message: "", consent: true });
  assert.equal(errors.name, "이름을 입력해 주세요.");
  assert.equal(errors.email, "이메일 형식을 확인해 주세요.");
  assert.equal(errors.message, "상담 내용을 입력해 주세요.");
  assert.equal(validateInquiry({ ...ok, name: "가".repeat(51) }).name, "이름은 50자까지 넣을 수 있습니다.");
  assert.equal(validateInquiry({ ...ok, message: "가".repeat(1001) }).message, "상담 내용은 1000자까지 넣을 수 있습니다.");
});
