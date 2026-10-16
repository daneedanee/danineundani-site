import type { PillarKey } from "./topics.ts";

// 게시판 글. 표는 supabase/05-posts.sql 의 cab_posts.
export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content_md: string;
  cover_image_url: string | null;
  // 칼럼 기둥과 그 안의 가지(자유 입력). 둘 다 비워 둘 수 있다.
  pillar: PillarKey | null;
  branch: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// 목록에 쓰는 줄.
export type PostSummary = Pick<Post, "slug" | "title" | "description" | "cover_image_url" | "published_at" | "pillar" | "branch">;

// 사이트맵과 미리 만들 주소 목록에 쓰는 줄.
export type PostRef = Pick<Post, "slug" | "updated_at" | "pillar">;
