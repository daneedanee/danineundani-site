import { videoLinkTarget } from "@/lib/visibility/video-links";

// 유튜브 설명란 짧은 링크: /v/20261028/about → /about?utm_source=youtube&utm_medium=video&utm_campaign=yt_20261028
// 잠깐 넘기는 주소라 307 로 보낸다(검색엔진이 이 주소를 대신 색인하지 않게).
export async function GET(request: Request, { params }: { params: Promise<{ video: string; page?: string[] }> }) {
  const { video, page } = await params;
  const target = page && page.length > 1 ? null : videoLinkTarget(video, page?.[0]);
  if (!target) return new Response("Not found", { status: 404 });
  return Response.redirect(new URL(target, request.url), 307);
}
