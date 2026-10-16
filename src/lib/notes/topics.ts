// 칼럼 기둥(주제 묶음). 기둥은 코드에 고정해 두고, 글은 기둥 하나와 자유 입력 가지를 가질 수 있다.
export const PILLARS = [
  { key: "blog-marketing", name: "블로그마케팅" },
  { key: "small-business-marketing", name: "자영업자 마케팅" },
] as const;

export type PillarKey = "blog-marketing" | "small-business-marketing";

// 가지는 자유 입력이고 40자까지. supabase/07-post-topics.sql 의 제약과 같은 값.
export const BRANCH_MAX = 40;

export function isPillarKey(value: unknown): value is PillarKey {
  return PILLARS.some((p) => p.key === value);
}

export function pillarName(key: string | null): string | null {
  return PILLARS.find((p) => p.key === key)?.name ?? null;
}

// 기둥 허브 페이지 주소.
export function hubPath(key: PillarKey): string {
  return `/notes/topic/${key}`;
}
