// 관리 화면(/admin/notes)이 쓰는 읽기·쓰기. 브라우저에서 로그인한 계정으로 돈다.
// 누가 쓸 수 있는지는 화면이 아니라 데이터베이스 권한(supabase/05-posts.sql)이 정한다.
import { supabase } from "@/lib/supabase";

import { checkImageFile, IMAGE_BUCKET, imageExtension } from "./images";
import type { Post, PostStatus } from "./types";
import type { PostInput } from "./validate";
import { writeOutcome } from "./write-outcome";

const postsTable = "cab_posts";

export type ApiResult<T = object> = ({ ok: true } & T) | { ok: false; message: string };

export async function listAllPosts(): Promise<ApiResult<{ posts: Post[] }>> {
  const { data, error } = await supabase
    .from(postsTable)
    .select("*")
    .order("updated_at", { ascending: false })
    .returns<Post[]>();

  if (error) {
    console.error("글 목록을 불러오지 못했습니다", error);
    return { ok: false, message: "글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
  return { ok: true, posts: data ?? [] };
}

export async function savePost(
  id: string | null,
  input: PostInput,
  status: PostStatus,
): Promise<ApiResult<{ id: string }>> {
  const row = {
    slug: input.slug,
    title: input.title.trim(),
    description: input.description.trim(),
    content_md: input.content_md,
    cover_image_url: input.cover_image_url.trim() || null,
    status,
  };

  // .select() 를 붙여 바뀐 줄을 돌려받는다. 권한이 없으면 수정은 오류 없이 0줄이 된다.
  const { data, error } = id
    ? await supabase.from(postsTable).update(row).eq("id", id).select("id")
    : await supabase.from(postsTable).insert(row).select("id");

  if (error) console.error("글을 저장하지 못했습니다", error);
  const outcome = writeOutcome({ error, rows: data?.length ?? 0 });
  if (!outcome.ok) return outcome;
  // 새 글을 초안으로 저장한 뒤 편집을 이어 갈 때, 다음 저장이 같은 글을 고치도록 id 를 돌려준다.
  return { ok: true, id: String(data?.[0]?.id) };
}

export async function deletePost(id: string): Promise<ApiResult> {
  const { data, error } = await supabase.from(postsTable).delete().eq("id", id).select("id");
  if (error) console.error("글을 지우지 못했습니다", error);
  return writeOutcome({ error, rows: data?.length ?? 0 });
}

export async function uploadPostImage(file: File): Promise<ApiResult<{ url: string }>> {
  const problem = checkImageFile(file);
  if (problem) return { ok: false, message: problem };

  // 연/월 폴더 아래 겹치지 않는 이름으로 올린다. 원래 파일 이름은 쓰지 않는다 (한글·공백이 주소를 깨뜨린다).
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const path = `${now.getFullYear()}/${month}/${crypto.randomUUID()}.${imageExtension(file.type)}`;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    console.error("이미지를 올리지 못했습니다", error);
    return { ok: false, message: "이미지를 올리지 못했습니다. 관리자 계정으로 로그인했는지 확인해 주세요." };
  }

  return { ok: true, url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl };
}

// 저장해 둔 게시판 페이지를 새로 만들게 한다. 실패해도 글은 이미 저장돼 있고 1시간 안에 저절로 반영된다.
export async function requestRevalidate(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("/api/notes/revalidate", {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}
