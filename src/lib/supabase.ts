import { createClient } from "@supabase/supabase-js";

// 상담 신청 저장용 Supabase 연결.
// 표와 권한은 supabase/01-inquiries.sql 에서 만든다. 방문자(anon)는 추가만 할 수 있고,
// 저장된 신청을 읽거나 고치거나 지울 수는 없다.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Supabase 주소와 키가 없습니다. my-business-site/.env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 넣어 주세요.",
  );
}

export const supabase = createClient(url, publishableKey);

export const inquiriesTable = "cab_inquiries";
