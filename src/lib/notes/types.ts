// 게시판 글. 표는 supabase/05-posts.sql 의 cab_posts.
export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content_md: string;
  cover_image_url: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// 목록에 쓰는 줄.
export type PostSummary = Pick<Post, "slug" | "title" | "description" | "cover_image_url" | "published_at">;

// 사이트맵과 미리 만들 주소 목록에 쓰는 줄.
export type PostRef = Pick<Post, "slug" | "updated_at">;
