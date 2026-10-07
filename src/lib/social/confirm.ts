// 발행 잠금 장치.
//
// 미리보기 단계에서 "이 글, 이 사진, 이 채널"에 대한 확인표를 하나 만들어 준다.
// 발행 단계는 이 확인표가 같아야만 진행된다. 글자 하나라도 바뀌면 확인표가 맞지 않아
// 발행되지 않고, 미리보기부터 다시 해야 한다. 확인표는 10분 뒤 만료된다.
import { createHmac, timingSafeEqual } from "node:crypto";

import { confirmSecret } from "./config";

export const CONFIRM_TTL_MS = 10 * 60 * 1000;

export type PublishPlan = {
  targets: ("instagram" | "threads")[];
  caption: string;
  imageUrl: string;
};

function fingerprint(plan: PublishPlan, issuedAt: number) {
  const canonical = JSON.stringify({
    targets: [...plan.targets].sort(),
    caption: plan.caption,
    imageUrl: plan.imageUrl,
    issuedAt,
  });
  return createHmac("sha256", confirmSecret()).update(canonical).digest("hex");
}

export function issueConfirmToken(plan: PublishPlan) {
  const issuedAt = Date.now();
  return { token: `${issuedAt}.${fingerprint(plan, issuedAt)}`, expiresAt: issuedAt + CONFIRM_TTL_MS };
}

export function verifyConfirmToken(plan: PublishPlan, token: string): string | null {
  const [rawIssuedAt, signature] = token.split(".");
  const issuedAt = Number(rawIssuedAt);
  if (!Number.isFinite(issuedAt) || !signature) return "확인표 형식이 올바르지 않습니다. 미리보기부터 다시 해 주세요.";
  if (Date.now() - issuedAt > CONFIRM_TTL_MS) return "확인한 지 10분이 지났습니다. 미리보기부터 다시 해 주세요.";

  const expected = Buffer.from(fingerprint(plan, issuedAt), "hex");
  const given = Buffer.from(signature, "hex");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return "미리보기에서 확인한 내용과 다릅니다. 미리보기부터 다시 해 주세요.";
  }
  return null;
}
