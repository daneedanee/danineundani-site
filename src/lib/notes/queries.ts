// 서버에서 발행한 글을 읽는다. 공개 페이지(/notes)와 사이트맵이 쓴다.
// anon 키로 읽기 때문에 데이터베이스 권한(supabase/05-posts.sql)이 발행한 글만 내준다.
// 여기 코드가 실수해도 초안은 새지 않는다. 서비스 키는 쓰지 않는다.
//
// 모든 함수는 오류가 나면 던진다. 이유는 rows.ts 의 주석을 본다.
import { createClient } from "@supabase/supabase-js";

import { pageRange } from "./paging.ts";
import { countOrThrow, rowsOrThrow } from "./rows.ts";
import type { Post, PostRef, PostSummary } from "./types";

const postsTable = "cab_posts";

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase 주소와 키가 없습니다. NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 확인해 주세요.");
  }
  // 서버에는 로그인 상태가 없다. 세션을 저장하거나 갱신하지 않는다.
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function countPublished(): Promise<number> {
  const result = await serverClient()
    .from(postsTable)
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  return countOrThrow(result, "글 수");
}

export async function listPublishedPage(page: number): Promise<PostSummary[]> {
  const { from, to } = pageRange(page);
  const result = await serverClient()
    .from(postsTable)
    .select("slug, title, description, cover_image_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);
  return rowsOrThrow<PostSummary>(result, "글 목록");
}

export async function getPublishedBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await serverClient()
    .from(postsTable)
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<Post>();
  if (error) throw new Error(`글을 읽지 못했습니다: ${error.message}`);
  return data;
}

export async function listAllPublished(): Promise<PostRef[]> {
  const result = await serverClient()
    .from(postsTable)
    .select("slug, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return rowsOrThrow<PostRef>(result, "글 주소 목록");
}
