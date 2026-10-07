// 이 API를 누가 부를 수 있는지 정한다.
// 관리자 화면에서 로그인한 대표 본인만 통과한다. (/admin 과 같은 계정)
import { createClient } from "@supabase/supabase-js";

import { ADMIN_EMAIL } from "./config";

export async function requireAdmin(request: Request): Promise<{ email: string } | Response> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return Response.json({ error: "서버에 Supabase 설정이 없습니다." }, { status: 500 });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) {
    return Response.json({ error: "로그인 정보를 확인하지 못했습니다." }, { status: 401 });
  }
  if (data.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return Response.json({ error: "관리자만 쓸 수 있습니다." }, { status: 403 });
  }
  return { email: data.user.email };
}
