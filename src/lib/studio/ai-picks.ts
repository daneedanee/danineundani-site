// 대본(SRT) 내용으로 구간을 고르는 기능의 공용 부분.
// 두 가지 방식이 같은 기준을 쓴다.
// - AI 자동: 서버(src/app/api/studio/pick/route.ts)가 Claude API를 부른다. (사용료 듦)
// - 채팅에 직접: 대표가 Claude 채팅에 글을 붙여 넣고, 받은 답을 편집기에 붙여 넣는다. (API 사용료 없음)

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

/** 좋은 쇼츠 구간을 고르는 기준. AI 자동과 채팅용 글이 함께 쓴다. */
export const CLIP_CRITERIA = `너는 '다니는다니'(블로그 마케팅 강의·컨설팅) 유튜브 채널의 쇼츠 편집자다.
롱폼·미드폼 영상의 자막 대본을 읽고, 쇼츠로 잘라 올릴 구간을 고른다.

좋은 구간:
- 그 구간만 봐도 이해되는, 앞뒤 맥락 없이 완결된 이야기
- 첫 문장이 바로 궁금증·문제·반전을 던지는 구간 (후킹)
- 시청자가 저장하고 싶을 만큼 구체적인 핵심 정보·방법·숫자가 있는 구간 (핵심)
- 인사, 자기소개, 구독 부탁, 다음 영상 예고, 광고는 고르지 않는다

규칙:
- 각 클립의 길이는 요청한 길이에 최대한 가깝게, 요청 길이의 70%~130% 안에 둔다.
- 문장 중간에서 시작하거나 끝나지 않게 한다. 자막 줄의 시작·끝 시각에 맞춘다.
- 클립끼리 겹치지 않게 한다.
- 좋은 순서(가장 먼저 올릴 만한 것)대로 나열한다.
- 헤드 문구는 영상 맨 위에 크게 들어갈 제목이다. 두 줄로, 한 줄에 공백 포함 12자 이내, 대본에 실제로 나온 내용만 쓴다. 과장하거나 대본에 없는 숫자·약속을 만들지 않는다.`;

/** 초 → "분:초.소수" (예: 201.5 → "3:21.5") */
export function formatCueTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${m}:${s}`;
}

export function formatTranscript(cues: PickRequest["cues"]) {
  return cues
    .map((c, i) => `#${i} [${formatCueTime(c.start)}–${formatCueTime(c.end)}] ${c.text.replace(/\s+/g, " ").trim()}`)
    .join("\n");
}

/** Claude 채팅(구독)에 그대로 붙여 넣을 글. 답 형식은 parsePastedPicks가 읽을 수 있는 모양으로 정한다. */
export function buildChatPrompt(cues: PickRequest["cues"], length: number, count: number) {
  return `${CLIP_CRITERIA}

아래 대본에서 쇼츠 구간을 ${count}개 골라 줘. 클립 하나의 길이는 약 ${length}초.

답은 설명 없이 아래 형식으로, 한 줄에 클립 하나씩만 써 줘.
시작 ~ 끝 | 후킹 또는 핵심 | 헤드 문구 첫 줄 / 헤드 문구 둘째 줄 | 고른 이유 한 문장
예) 3:21.5 ~ 4:05.0 | 후킹 | 블로그 글 끝에 / 이것 안 넣으면 손해 | 첫 문장에서 바로 문제를 던진다

<대본>
${formatTranscript(cues)}
</대본>`;
}

const TIME = String.raw`(?:\d{1,2}:)?\d{1,3}:\d{1,2}(?:[.,]\d+)?`;

function parseTime(value: string) {
  const parts = value.replace(",", ".").split(":").map(Number);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

/**
 * 채팅 답(또는 직접 타이핑한 글)을 읽어 구간 목록으로 바꾼다.
 * 한 줄에 시각 두 개(시작, 끝)가 있으면 클립 하나로 본다. 나머지는 | 로 나눈다.
 *   3:21 ~ 4:05 | 후킹 | 첫 줄 / 둘째 줄 | 이유
 */
export function parsePastedPicks(text: string): AiPick[] {
  const picks: AiPick[] = [];
  const timeRe = new RegExp(TIME, "g");
  for (const raw of text.split("\n")) {
    const line = raw.replace(/[`*]/g, "").trim();
    const times = line.match(timeRe);
    if (!times || times.length < 2) continue;
    const start = parseTime(times[0]);
    const end = parseTime(times[1]);
    if (!(end > start)) continue;

    const fields = line
      .split("|")
      .slice(1)
      .map((f) => f.trim())
      .filter(Boolean);
    let kind: AiPick["kind"] = "core";
    const kindIndex = fields.findIndex((f) => /^(후킹|핵심|hook|core)$/i.test(f));
    if (kindIndex >= 0) {
      kind = /후킹|hook/i.test(fields[kindIndex]) ? "hook" : "core";
      fields.splice(kindIndex, 1);
    }
    const title = (fields[0] ?? "").split(/\s*\/\s*/).join("\n");
    const reason = fields.slice(1).join(" ");
    if (picks.some((p) => start < p.end && p.start < end)) continue;
    picks.push({ start, end, kind, title, reason });
  }
  return picks;
}
