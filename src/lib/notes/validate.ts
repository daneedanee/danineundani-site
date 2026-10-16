// 저장 전에 입력을 살핀다. 같은 제한이 데이터베이스(supabase/05-posts.sql)에도 걸려 있다.
import { isValidSlug } from "./slug.ts";
import { BRANCH_MAX, isPillarKey } from "./topics.ts";

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 200;

export type PostInput = {
  slug: string;
  title: string;
  description: string;
  content_md: string;
  cover_image_url: string;
  // 빈 문자열은 "없음". 기둥은 topics.ts 의 목록에 있는 키만 된다.
  pillar: string;
  branch: string;
};

export function validatePost(input: PostInput, intent: "draft" | "publish"): string[] {
  const problems: string[] = [];
  const title = input.title.trim();
  const description = input.description.trim();
  const cover = input.cover_image_url.trim();

  if (!title) problems.push("제목을 적어 주세요.");
  else if (title.length > TITLE_MAX) problems.push(`제목은 ${TITLE_MAX}자까지 쓸 수 있습니다.`);

  if (!isValidSlug(input.slug)) {
    problems.push("주소는 영문 소문자·숫자·한글과 - 만, 60자까지 쓸 수 있습니다. 예: blog-seo-2026");
  }

  if (description.length > DESCRIPTION_MAX) problems.push(`설명은 ${DESCRIPTION_MAX}자까지 쓸 수 있습니다.`);
  else if (intent === "publish" && !description) {
    problems.push("발행하려면 설명을 적어 주세요. 검색 결과에 나오는 문장입니다.");
  }

  if (intent === "publish" && !input.content_md.trim()) problems.push("발행하려면 본문을 적어 주세요.");

  if (cover && !cover.startsWith("https://")) problems.push("대표 이미지 주소는 https:// 로 시작해야 합니다.");

  if (input.pillar !== "" && !isPillarKey(input.pillar)) problems.push("주제는 목록에서 골라 주세요.");
  if (input.branch.trim().length > BRANCH_MAX) problems.push(`가지 이름은 ${BRANCH_MAX}자까지 쓸 수 있습니다.`);

  return problems;
}
