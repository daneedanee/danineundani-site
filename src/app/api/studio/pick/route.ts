// 쇼츠 편집기: 대본(SRT)을 Claude에게 읽혀서 중요한 구간·후킹 구간을 고른다.
//
// - 쓰려면 Vercel 환경 변수에 ANTHROPIC_API_KEY 가 있어야 한다. (호출할 때마다 사용료가 든다)
// - 아무나 부르지 못하도록 관리자 로그인(/admin 과 같은 Supabase 계정)을 확인한다.
// - 서버로 오는 것은 자막 글자와 시간뿐이다. 영상은 오지 않는다.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

import { CLIP_CRITERIA, formatTranscript, STUDIO_ADMIN_EMAILS } from "@/lib/studio/ai-picks";
import type { AiPick, PickRequest, PickResponse } from "@/lib/studio/ai-picks";
import { supabase } from "@/lib/supabase";

// 1시간짜리 대본이면 1~3분쯤 걸린다.
export const maxDuration = 300;

const MAX_CUES = 6000;

const PickSchema = z.object({
  clips: z.array(
    z.object({
      first_line: z.number().int().describe("클립이 시작하는 자막 줄 번호 (#번호)"),
      last_line: z.number().int().describe("클립이 끝나는 자막 줄 번호 (#번호)"),
      kind: z.enum(["hook", "core"]),
      title: z.string().describe("헤드 문구. 두 줄, 줄바꿈(\\n)으로 나눔"),
      reason: z.string().describe("이 구간을 고른 이유 한 문장"),
    }),
  ),
});

// 줄 번호·영어 kind 값은 서버용 구조화 답에만 쓰는 규칙이라 여기서 덧붙인다.
const SYSTEM_PROMPT = `${CLIP_CRITERIA}

답 형식:
- 클립은 자막 줄 번호로 정한다. first_line의 시작 시각부터 last_line의 끝 시각까지가 한 클립이다.
- kind는 후킹이면 hook, 핵심이면 core.
- title은 헤드 문구 두 줄을 줄바꿈(\\n)으로 나눈다.
- reason은 한국어 한 문장.`;

function json(body: PickResponse, status = 200) {
  return Response.json(body, { status });
}

function isPickRequest(value: unknown): value is PickRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.cues) &&
    typeof v.length === "number" &&
    typeof v.count === "number" &&
    v.cues.every(
      (c) =>
        c &&
        typeof c === "object" &&
        typeof (c as Record<string, unknown>).start === "number" &&
        typeof (c as Record<string, unknown>).end === "number" &&
        typeof (c as Record<string, unknown>).text === "string",
    )
  );
}

export async function POST(request: Request) {
  // 1) 관리자 확인
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "관리자 로그인이 필요해요. /admin 에서 먼저 로그인해 주세요." }, 401);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const email = userData.user?.email?.toLowerCase();
  if (userError || !email || !STUDIO_ADMIN_EMAILS.includes(email)) {
    return json({ error: "관리자 계정만 쓸 수 있어요. /admin 에서 관리자 계정으로 로그인해 주세요." }, 403);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "서버에 ANTHROPIC_API_KEY 가 없어요. Vercel 환경 변수에 넣은 뒤 다시 배포해 주세요." }, 500);
  }

  // 2) 입력 확인
  const body: unknown = await request.json().catch(() => null);
  if (!isPickRequest(body) || !body.cues.length) {
    return json({ error: "자막 파일 내용을 읽지 못했어요." }, 400);
  }
  if (body.cues.length > MAX_CUES) {
    return json({ error: `자막이 너무 길어요 (${body.cues.length}줄). ${MAX_CUES}줄 이하로 나눠 주세요.` }, 400);
  }
  const length = Math.min(180, Math.max(10, body.length));
  const count = Math.min(15, Math.max(1, Math.round(body.count)));
  const cues = body.cues;

  const transcript = formatTranscript(cues);

  // 3) Claude에게 고르게 한다
  const client = new Anthropic();
  try {
    const stream = client.beta.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(PickSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `아래 대본에서 쇼츠 구간을 ${count}개 골라 줘. 클립 하나의 길이는 약 ${length}초.\n\n<대본>\n${transcript}\n</대본>`,
        },
      ],
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      return json({ error: "AI가 이 대본 분석을 거절했어요. 다른 영상으로 해 보거나 소리 기준으로 골라 주세요." }, 502);
    }
    const parsed = message.parsed_output;
    if (!parsed) return json({ error: "AI 답을 읽지 못했어요. 다시 시도해 주세요." }, 502);

    // 4) 줄 번호를 시간으로 바꾸고, 겹치거나 이상한 것은 걸러 낸다
    const picks: AiPick[] = [];
    for (const clip of parsed.clips) {
      const first = Math.max(0, Math.min(cues.length - 1, Math.min(clip.first_line, clip.last_line)));
      const last = Math.max(0, Math.min(cues.length - 1, Math.max(clip.first_line, clip.last_line)));
      const start = Math.max(0, cues[first].start - 0.2);
      const end = cues[last].end + 0.3;
      if (end - start < 3) continue;
      if (picks.some((p) => start < p.end && p.start < end)) continue;
      picks.push({ start, end, kind: clip.kind, title: clip.title.trim(), reason: clip.reason.trim() });
      if (picks.length >= count) break;
    }
    return json({ picks });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return json({ error: "ANTHROPIC_API_KEY 가 올바르지 않아요. Vercel 환경 변수를 확인해 주세요." }, 500);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return json({ error: "AI 사용량 한도에 걸렸어요. 잠시 뒤 다시 시도해 주세요." }, 429);
    }
    if (error instanceof Anthropic.APIError) {
      return json({ error: `AI 호출에 실패했어요 (${error.status ?? "연결 오류"}). 잠시 뒤 다시 시도해 주세요.` }, 502);
    }
    throw error;
  }
}
