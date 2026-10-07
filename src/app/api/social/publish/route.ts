// 게시. 두 단계로만 진행된다.
//
//   1) stage: "preview"  — 아무것도 올리지 않고, 올라갈 내용과 확인표만 돌려준다.
//   2) stage: "publish"  — 미리보기에서 받은 확인표가 맞을 때만 실제로 올린다.
//
// 확인표 없이 들어온 발행 요청은 그냥 거절한다.
import { publishInstagram, publishThreads, type PublishResult } from "@/lib/social/api";
import { issueConfirmToken, verifyConfirmToken, type PublishPlan } from "@/lib/social/confirm";
import { instagramAccount, threadsAccount } from "@/lib/social/config";
import { requireAdmin } from "@/lib/social/guard";

export const dynamic = "force-dynamic";

const TARGETS = ["instagram", "threads"] as const;

function readPlan(body: Record<string, unknown>): PublishPlan | string {
  const rawTargets = Array.isArray(body.targets) ? body.targets : [];
  const targets = TARGETS.filter((t) => rawTargets.includes(t));
  if (targets.length === 0) return "올릴 채널을 하나 이상 골라 주세요.";

  const caption = typeof body.caption === "string" ? body.caption.trim() : "";
  if (!caption) return "올릴 글을 적어 주세요.";

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  if (targets.includes("instagram") && !imageUrl) {
    return "인스타그램은 사진 없이 올릴 수 없습니다. 사진 주소를 넣거나 인스타그램을 빼 주세요.";
  }
  if (imageUrl && !/^https:\/\//.test(imageUrl)) {
    return "사진 주소는 https:// 로 시작하는 공개 주소여야 합니다.";
  }
  return { targets, caption, imageUrl };
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "요청 내용을 읽지 못했습니다." }, { status: 400 });

  const plan = readPlan(body);
  if (typeof plan === "string") return Response.json({ error: plan }, { status: 400 });

  const missing = [
    plan.targets.includes("instagram") && !instagramAccount() ? "인스타그램" : null,
    plan.targets.includes("threads") && !threadsAccount() ? "스레드" : null,
  ].filter(Boolean);
  if (missing.length > 0) {
    return Response.json({ error: `${missing.join(", ")} 토큰이 아직 없습니다.` }, { status: 400 });
  }

  if (body.stage === "preview") {
    const confirm = issueConfirmToken(plan);
    return Response.json({ stage: "preview", plan, ...confirm });
  }

  if (body.stage !== "publish") {
    return Response.json({ error: "stage 는 preview 또는 publish 여야 합니다." }, { status: 400 });
  }

  const token = typeof body.confirmToken === "string" ? body.confirmToken : "";
  if (!token) {
    return Response.json({ error: "대표 확인을 거치지 않은 요청입니다." }, { status: 428 });
  }
  const problem = verifyConfirmToken(plan, token);
  if (problem) return Response.json({ error: problem }, { status: 409 });

  // 여기서부터 실제로 올라간다.
  const results: PublishResult[] = [];
  const failures: { target: string; message: string }[] = [];

  for (const target of plan.targets) {
    try {
      results.push(
        target === "instagram"
          ? await publishInstagram(plan.caption, plan.imageUrl)
          : await publishThreads(plan.caption, plan.imageUrl || undefined),
      );
    } catch (error) {
      failures.push({ target, message: error instanceof Error ? error.message : String(error) });
    }
  }

  return Response.json({ stage: "publish", results, failures }, { status: failures.length > 0 ? 207 : 200 });
}
