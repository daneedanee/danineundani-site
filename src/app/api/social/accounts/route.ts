// 읽기 전용. 내 인스타그램·스레드 계정 정보와 성과만 가져온다.
// 이 경로에서는 아무것도 올리지 않는다.
import { readInstagram, readThreads } from "@/lib/social/api";
import { requireAdmin } from "@/lib/social/guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const [instagram, threads] = await Promise.all([readInstagram(), readThreads()]);
  return Response.json({ checkedAt: new Date().toISOString(), instagram, threads });
}
