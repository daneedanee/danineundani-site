// 손님이 보는 게시판 주소. 메뉴 이름을 "칼럼"에서 "블로그"로 바꾸며 /notes 에서 /blog 로 옮겼다 (2026-10-26 대표 요청).
// 관리 화면(/admin/notes)과 새로 고침 API(/api/notes/revalidate)는 안쪽 주소라 그대로 둔다.
export const BLOG_PATH = "/blog";

export function postPath(slug: string): string {
  return `${BLOG_PATH}/${encodeURIComponent(slug)}`;
}

// 옛 주소로 들어오면 같은 자리의 새 주소로 넘긴다(308). next.config.ts 가 쓴다.
export function legacyRedirects() {
  return [
    { source: "/notes", destination: BLOG_PATH, permanent: true },
    { source: "/notes/:path*", destination: `${BLOG_PATH}/:path*`, permanent: true },
  ];
}
