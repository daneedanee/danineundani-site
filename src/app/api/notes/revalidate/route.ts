// 글을 발행·수정·삭제한 뒤 관리 화면이 부른다. 대시보드 "홈페이지로 보내기"도 발행한 뒤 부른다.
// 저장해 둔 게시판 페이지, 주제 모음(허브) 페이지, 사이트맵을 버려서, 다음 방문 때 새로 만들게 한다.
// 그다음 방금 바뀐 글 주소를 네이버에 알린다(IndexNow, 2026-10-29).
// 부를 수 있는 사람은 /admin 에 로그인한 관리자뿐이다.
import { revalidatePath } from "next/cache";

import { changedUrls, notifyIndexNow } from "@/lib/indexnow";
import { listAllPublished } from "@/lib/notes/queries";
import { allowIndexing } from "@/lib/seo";
import { requireAdmin } from "@/lib/social/guard";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  revalidatePath("/blog");
  revalidatePath("/blog/page/[page]", "page");
  // 글이 많지 않아서 글 페이지는 통째로 버린다. 한글 주소의 인코딩을 여기서 맞출 필요도 없어진다.
  revalidatePath("/blog/[slug]", "page");
  // 발행·내림·삭제·주제 변경이 모음 페이지에 바로 보이게 한다.
  revalidatePath("/blog/topic/[pillar]", "page");
  revalidatePath("/sitemap.xml");

  return Response.json({ ok: true, indexnow: await announceToNaver() });
}

// 알리기가 실패해도 발행과 새로 고침은 이미 끝났다. 응답은 그대로 성공으로 두고 기록만 남긴다.
// 검색 노출을 꺼 둔 동안(로컬·미리보기 배포 포함)에는 보내지 않는다.
async function announceToNaver(): Promise<{ sent: number; status: number | null } | { error: string }> {
  if (!allowIndexing) return { sent: 0, status: null };
  try {
    const result = await notifyIndexNow(changedUrls(await listAllPublished(), new Date()));
    if (result.status !== null && result.status !== 200 && result.status !== 202) {
      console.error("네이버가 새 글 알림을 받지 않았습니다", result);
    }
    return result;
  } catch (error) {
    console.error("네이버에 새 글을 알리지 못했습니다", error);
    return { error: "네이버에 알리지 못했습니다" };
  }
}
