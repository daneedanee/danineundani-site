// 글 하나에 붙일 관련 글을 고른다. 같은 가지를 먼저, 그다음 같은 기둥의 나머지 순서다.
import type { Post, PostSummary } from "./types";

function byNewest(a: PostSummary, b: PostSummary): number {
  return (b.published_at ?? "").localeCompare(a.published_at ?? "");
}

export function pickRelated(
  post: Pick<Post, "slug" | "pillar" | "branch">,
  candidates: PostSummary[],
  limit = 3,
): PostSummary[] {
  if (!post.pillar) return [];
  const samePillar = candidates.filter((c) => c.pillar === post.pillar && c.slug !== post.slug).sort(byNewest);
  const sameBranch = post.branch ? samePillar.filter((c) => c.branch === post.branch) : [];
  const rest = samePillar.filter((c) => !sameBranch.includes(c));
  return [...sameBranch, ...rest].slice(0, limit);
}
