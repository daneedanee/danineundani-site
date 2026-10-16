// 글을 발행·수정·삭제한 뒤 관리 화면이 부른다.
// 저장해 둔 게시판 페이지, 주제 모음(허브) 페이지, 사이트맵을 버려서, 다음 방문 때 새로 만들게 한다.
// 부를 수 있는 사람은 /admin 에 로그인한 관리자뿐이다.
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/social/guard";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  revalidatePath("/notes");
  revalidatePath("/notes/page/[page]", "page");
  // 글이 많지 않아서 글 페이지는 통째로 버린다. 한글 주소의 인코딩을 여기서 맞출 필요도 없어진다.
  revalidatePath("/notes/[slug]", "page");
  // 발행·내림·삭제·주제 변경이 모음 페이지에 바로 보이게 한다.
  revalidatePath("/notes/topic/[pillar]", "page");
  revalidatePath("/sitemap.xml");

  return Response.json({ ok: true });
}
