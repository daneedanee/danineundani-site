const dateFormat = new Intl.DateTimeFormat("ko-KR", { dateStyle: "long", timeZone: "Asia/Seoul" });

// 서버(UTC)에서 그려도 한국 날짜가 나오게 시간대를 고정한다.
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}
