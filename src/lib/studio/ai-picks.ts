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
  /** 여러 컷을 이어붙이는 클립이면 컷 목록 (원본 기준). start·end는 첫 컷 시작과 마지막 컷 끝 */
  segments?: { start: number; end: number }[];
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
- 같은 주제라면 떨어져 있는 컷 여러 개를 이어붙여 쇼츠 하나로 만들어도 된다. 컷 길이를 모두 더한 것이 클립 길이다.

아래 대본에서 쇼츠를 ${count}개 만들어 줘. 쇼츠 하나의 길이는 약 ${length}초.

답은 아래 형식으로 써 줘. 쇼츠마다 첫 줄은 "쇼츠 번호 | 후킹 또는 핵심 | 헤드 문구 첫 줄 / 둘째 줄", 그 아래에 이유 한 줄, 그 아래에 이어붙일 컷을 순서대로 한 줄에 하나씩.
쇼츠 1 | 후킹 | 블로그 글 끝에 / 이것 안 넣으면 손해
이유: 첫 문장에서 바로 문제를 던진다
컷: 3:21.5 ~ 3:40.0
컷: 5:02.0 ~ 5:20.5

<대본>
${formatTranscript(cues)}
</대본>`;
}

const TIME = String.raw`(?:\d{1,2}:)?\d{1,3}:\d{1,2}(?:[.,]\d+)?`;

function parseTime(value: string) {
  const parts = value.replace(",", ".").split(":").map(Number);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

/** 한 줄에서 "시작 ~ 끝" 시각 두 개를 찾는다. */
function findRange(line: string): { start: number; end: number } | null {
  const times = line.match(new RegExp(TIME, "g"));
  if (!times || times.length < 2) return null;
  const start = parseTime(times[0]);
  const end = parseTime(times[1]);
  return end > start ? { start, end } : null;
}

function cleanLine(raw: string) {
  return raw.replace(/[`*]/g, "").trim();
}

function kindOf(text: string): AiPick["kind"] | null {
  if (/후킹|hook/i.test(text)) return "hook";
  if (/핵심|core/i.test(text)) return "core";
  return null;
}

/** "쇼츠 1", "## 숏츠 2", "Shorts 3", "클립 4" 처럼 쇼츠 하나가 시작되는 줄 */
const BLOCK_HEADER = /^(?:#+\s*)?(?:쇼츠|숏츠|shorts?|클립)\s*#?\s*\d+/i;

/** 쇼츠 하나의 첫 줄에서 헤드 문구·종류를 꺼낸다. */
function parseHeader(header: string): { title: string; kind: AiPick["kind"] | null } {
  const kind = kindOf(header);
  // 「제목」 『제목』 "제목" “제목” 처럼 따옴표로 감싼 제목이 있으면 그것을 쓴다.
  const quoted = header.match(/[「『“"]([^」』”"]+)[」』”"]/);
  if (quoted) return { title: quoted[1].trim(), kind };
  const fields = header
    .split("|")
    .map((f) => f.trim())
    .filter(Boolean);
  if (fields.length > 1) {
    const rest = fields.slice(1).filter((f) => !/^(후킹|핵심|hook|core)$/i.test(f));
    return { title: rest[0] ?? "", kind };
  }
  // 따옴표도 | 도 없으면 "쇼츠 1 ★ 1순위 ·" 같은 앞부분과 "(약 58초)"를 떼고 남은 글을 쓴다.
  const title = header
    .replace(BLOCK_HEADER, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[★☆·:|—-]|\d+\s*순위/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { title, kind };
}

/** 쇼츠 하나에 해당하는 여러 줄 → 클립 하나 (컷 여러 개) */
function parseBlock(lines: string[]): AiPick | null {
  const { title, kind } = parseHeader(lines[0]);
  const segments: { start: number; end: number }[] = [];
  let reason = "";
  for (const line of lines.slice(1)) {
    const range = findRange(line);
    if (range) {
      segments.push(range);
      continue;
    }
    const why = line.match(/^(?:이유|왜[^—:\-]*)\s*[—:\-]\s*(.+)$/);
    if (why && !reason) reason = why[1].trim();
  }
  if (!segments.length) return null;
  return {
    start: segments[0].start,
    end: segments[segments.length - 1].end,
    kind: kind ?? "core",
    title: title.split(/\s*\/\s*/).join("\n"),
    reason,
    segments,
  };
}

/**
 * 채팅 답(또는 직접 쓴 글)을 읽어 클립 목록으로 바꾼다. 두 가지 모양을 읽는다.
 *
 * 1) 쇼츠마다 여러 줄 (컷 이어붙이기). "쇼츠 1"로 시작하는 줄 아래의 시각 줄들이 컷이 된다.
 *      쇼츠 1 ★ 1순위 · 「네이버는 키워드마다 다른 걸 보여준다」 (약 58초)
 *      왜 1순위 — 화면이 증거예요.
 *      1	00:36 ~ 00:43	내용
 *      2	00:43 ~ 01:00	내용
 * 2) 한 줄에 클립 하나.
 *      3:21 ~ 4:05 | 후킹 | 첫 줄 / 둘째 줄 | 이유
 */
export function parsePastedPicks(text: string): AiPick[] {
  const lines = text.split("\n").map(cleanLine).filter(Boolean);

  if (lines.some((l) => BLOCK_HEADER.test(l))) {
    const picks: AiPick[] = [];
    let block: string[] | null = null;
    for (const line of lines) {
      if (BLOCK_HEADER.test(line)) {
        if (block) {
          const pick = parseBlock(block);
          if (pick) picks.push(pick);
        }
        block = [line];
      } else if (block) {
        block.push(line);
      }
    }
    if (block) {
      const pick = parseBlock(block);
      if (pick) picks.push(pick);
    }
    return picks;
  }

  const picks: AiPick[] = [];
  for (const line of lines) {
    const range = findRange(line);
    if (!range) continue;
    const fields = line
      .split("|")
      .slice(1)
      .map((f) => f.trim())
      .filter(Boolean);
    let kind: AiPick["kind"] = "core";
    const kindIndex = fields.findIndex((f) => /^(후킹|핵심|hook|core)$/i.test(f));
    if (kindIndex >= 0) {
      kind = kindOf(fields[kindIndex]) ?? "core";
      fields.splice(kindIndex, 1);
    }
    const title = (fields[0] ?? "").split(/\s*\/\s*/).join("\n");
    const reason = fields.slice(1).join(" ");
    if (picks.some((p) => range.start < p.end && p.start < range.end)) continue;
    picks.push({ ...range, kind, title, reason });
  }
  return picks;
}
