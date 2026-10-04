// 대본(SRT) 내용으로 구간을 고르는 기능의 공용 자료 모양.
// 서버(src/app/api/studio/pick/route.ts)와 화면(studio.tsx)이 함께 쓴다.

/** 이 기능을 쓸 수 있는 관리자 이메일. supabase/02-admin-read.sql 의 관리자와 같게 둔다. */
export const STUDIO_ADMIN_EMAILS = ["marktive@naver.com"];

export type PickRequest = {
  cues: { start: number; end: number; text: string }[];
  /** 원하는 클립 길이(초) */
  length: number;
  /** 몇 개 고를지 */
  count: number;
};

export type AiPick = {
  start: number;
  end: number;
  /** hook: 첫 3초에 시선을 잡는 구간 / core: 영상의 핵심 내용 */
  kind: "hook" | "core";
  /** 헤드 문구 제안 (두 줄, 줄바꿈 포함) */
  title: string;
  /** 왜 골랐는지 한 줄 */
  reason: string;
};

export type PickResponse = { picks: AiPick[] } | { error: string };
