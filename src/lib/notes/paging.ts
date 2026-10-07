// 목록 쪽 넘김. 무한 스크롤을 쓰지 않는다 — 검색 로봇은 스크롤을 내리지 않는다.
export const PAGE_SIZE = 10;

export function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

export function pageRange(page: number): { from: number; to: number } {
  const from = (page - 1) * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE - 1 };
}

// 주소의 쪽 번호. "02", "1e3" 같은 값은 같은 쪽의 다른 주소가 되므로 받지 않는다.
export function parsePageParam(raw: string): number | null {
  return /^[1-9]\d{0,5}$/.test(raw) ? Number(raw) : null;
}

export function notesPagePath(page: number): string {
  return page <= 1 ? "/notes" : `/notes/page/${page}`;
}
