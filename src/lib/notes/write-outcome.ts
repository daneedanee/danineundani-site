// Supabase 쓰기 결과를 화면에 보여 줄 말로 바꾼다.
// RLS 는 권한 없는 수정·삭제를 오류 없이 "0줄 바뀜"으로 돌려준다. 그래서 줄 수를 꼭 본다.
export type WriteResult = {
  error: { code?: string; message: string } | null;
  rows: number;
};

const notAdmin = "관리자만 쓸 수 있습니다. 관리자 계정으로 다시 로그인해 주세요.";

export function writeOutcome(result: WriteResult): { ok: true } | { ok: false; message: string } {
  const { error, rows } = result;
  if (error) {
    if (error.code === "23505") return { ok: false, message: "이미 쓰는 주소입니다. 주소를 바꿔 주세요." };
    if (error.code === "42501") return { ok: false, message: notAdmin };
    // 05-posts.sql 의 트리거가 한국어로 알려 주는 경우.
    if (error.message.includes("발행한 글의 주소")) return { ok: false, message: error.message };
    return { ok: false, message: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (rows === 0) return { ok: false, message: notAdmin };
  return { ok: true };
}
