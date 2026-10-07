// 인스타그램 · 스레드 연동 설정값.
// 이 파일은 서버에서만 쓴다. 토큰은 절대 NEXT_PUBLIC_ 로 시작하면 안 된다.
// (NEXT_PUBLIC_ 이 붙은 값은 브라우저로 그대로 전달돼서 누구나 볼 수 있다.)
export const INSTAGRAM_GRAPH = "https://graph.instagram.com/v25.0";
// 스레드 문서는 토큰 발급은 graph.threads.com, 장기 토큰·조회는 graph.threads.net 으로 안내한다.
// 앱 대시보드에 적힌 주소가 다르면 .env.local 의 THREADS_GRAPH_HOST 로 바꾼다.
export const THREADS_GRAPH = process.env.THREADS_GRAPH_HOST ?? "https://graph.threads.net/v1.0";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "marktive@naver.com";

type Account = { userId: string; token: string };

function readAccount(idKey: string, tokenKey: string): Account | null {
  const userId = process.env[idKey]?.trim();
  const token = process.env[tokenKey]?.trim();
  if (!userId || !token) return null;
  return { userId, token };
}

export function instagramAccount() {
  return readAccount("INSTAGRAM_USER_ID", "INSTAGRAM_ACCESS_TOKEN");
}

export function threadsAccount() {
  return readAccount("THREADS_USER_ID", "THREADS_ACCESS_TOKEN");
}

export function confirmSecret() {
  const secret = process.env.SOCIAL_CONFIRM_SECRET?.trim();
  if (!secret) {
    throw new Error("SOCIAL_CONFIRM_SECRET 이 없습니다. .env.local 에 아무나 모를 긴 문자열을 넣어 주세요.");
  }
  return secret;
}
