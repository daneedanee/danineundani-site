// Supabase 읽기 결과에서 줄을 꺼낸다. 오류를 빈 목록으로 바꾸지 않고 던진다.
// 빈 목록으로 바꾸면 Supabase 가 잠깐 멈춘 사이에 "글 없음" 화면이 저장돼 버린다.
// 던지면 Next.js 가 이전에 저장해 둔 페이지를 계속 내보낸다.
export function rowsOrThrow<T>(
  result: { data: T[] | null; error: { message: string } | null },
  what: string,
): T[] {
  if (result.error) {
    throw new Error(`${what}을 읽지 못했습니다: ${result.error.message}`);
  }
  return result.data ?? [];
}
