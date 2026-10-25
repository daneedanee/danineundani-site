// 홈 상담 신청 폼의 입력 검사. 글자 수 제한은 supabase/01-inquiries.sql 의 표 규칙과 같게 둔다.
// 개인정보 수집·이용 동의는 필수다 (2026-10-26 대표 결정, 문구는 site-content.ts 의 consult·privacyPolicy).
export type InquiryFields = { name: string; email: string; message: string; consent: boolean };
export type InquiryErrors = Partial<Record<keyof InquiryFields, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInquiry(fields: InquiryFields): InquiryErrors {
  const errors: InquiryErrors = {};
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();

  if (!name) errors.name = "이름을 입력해 주세요.";
  else if (name.length > 50) errors.name = "이름은 50자까지 넣을 수 있습니다.";

  if (!email) errors.email = "이메일을 입력해 주세요.";
  else if (!emailPattern.test(email)) errors.email = "이메일 형식을 확인해 주세요.";
  else if (email.length > 254) errors.email = "이메일이 너무 깁니다.";

  // 최소 글자 수 제한은 두지 않는다 (2026-09-20 대표 결정). 비어 있는 것만 막는다.
  if (!message) errors.message = "상담 내용을 입력해 주세요.";
  else if (message.length > 1000) errors.message = "상담 내용은 1000자까지 넣을 수 있습니다.";

  if (!fields.consent) errors.consent = "개인정보 수집·이용에 동의해 주세요.";

  return errors;
}
