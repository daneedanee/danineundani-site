// 편집 화면에 저장하지 않은 내용이 있는지 본다. 있으면 나가기 전에 한 번 묻는다.
import type { PostInput } from "./validate.ts";

const keys = ["slug", "title", "description", "content_md", "cover_image_url"] as const;

export function isDirty(saved: PostInput, current: PostInput): boolean {
  return keys.some((key) => saved[key] !== current[key]);
}
