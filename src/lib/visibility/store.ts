import type { EventRow } from './measurement.ts';

// 측정 한 줄을 데이터베이스 함수(supabase/09-visibility-record-function.sql)로 기록한다.
// 방문자용 공개 키로 이 함수만 부를 수 있다. 데이터베이스 전체 권한을 가진 서버 키는 쓰지 않는다
// (상담 건수 주소 /api/inquiry-count 와 같은 방식, 2026-10-26).
type Rpc = (fn: string, args: Record<string, string>) => PromiseLike<{ error: unknown }>;

export async function storeEvent(row: EventRow, rpc: Rpc): Promise<boolean> {
  try {
    const { error } = await rpc('cab_record_visibility_event', { p_event: row.event, p_path: row.path, p_campaign: row.campaign });
    return !error;
  } catch {
    return false;
  }
}
