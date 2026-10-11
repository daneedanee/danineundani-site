// 새 상담 신청이 「몇 건」인지만 알려 주는 주소. 매일 아침 도는 Claude Code 루틴이 부른다.
//   GET /api/inquiry-count?hours=24   (또는 hours=168)
//   → {"hours":24,"new_count":0,"latest_at":null}
//
// 이름·이메일·내용은 돌려주지 않는다. 그건 대표가 /admin 에서 로그인하고 본다.
// 건수는 데이터베이스 함수(supabase/06-new-inquiry-count.sql)가 세고, 여기서는 방문자용 키로 그 함수만 부른다.
// 이 주소를 둔 까닭: 루틴이 도는 클라우드에 키를 하나도 넣지 않으려고. 루틴은 이 주소만 알면 된다.
// 누구나 부를 수 있으므로 「최근 신청 건수」는 공개되는 셈이다 (대표 확인, 2026-10-11).
import { createClient } from "@supabase/supabase-js";

import { parseHours, sinceIso } from "@/lib/inquiries/hours";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const hours = parseHours(new URL(request.url).searchParams.get("hours"));
  if (hours === null) {
    return Response.json({ error: "hours 는 24 또는 168 만 쓸 수 있습니다." }, { status: 400, headers: noStore });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return Response.json({ error: "서버에 Supabase 설정이 없습니다." }, { status: 500, headers: noStore });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc("cab_new_inquiry_count", { since: sinceIso(hours) });

  const row = Array.isArray(data) ? data[0] : null;
  // 실패를 0건으로 돌려주지 않는다. 확인하지 못한 것과 0건은 다르다.
  if (error || !row || typeof row.new_count !== "number") {
    console.error("상담 신청 건수를 읽지 못했습니다", error);
    return Response.json({ error: "건수를 읽지 못했습니다." }, { status: 502, headers: noStore });
  }

  return Response.json({ hours, new_count: row.new_count, latest_at: row.latest_at ?? null }, { headers: noStore });
}
