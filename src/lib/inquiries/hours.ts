// 「새 상담 신청 건수」를 묻는 범위. 하루(24시간)와 7일(168시간) 둘만 받는다.
// 아무 범위나 받으면 누구든 시간을 잘게 바꿔 가며 신청이 들어온 때를 캐물을 수 있다.
export type Hours = 24 | 168;

export function parseHours(raw: string | null): Hours | null {
  if (raw === null) return 24;
  if (raw === "24") return 24;
  if (raw === "168") return 168;
  return null;
}

export function sinceIso(hours: Hours, now: Date = new Date()): string {
  return new Date(now.getTime() - hours * 3600_000).toISOString();
}
