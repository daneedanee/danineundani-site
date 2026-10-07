// 글 이미지. 보관함은 supabase/05-posts.sql 에서 만든다.
export const IMAGE_BUCKET = "cab-post-images";
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// next/image 는 next.config.ts 에 허용한 주소만 받는다. 우리 보관함 주소일 때만 next/image 를 쓰려고 가른다.
export function isStorageImage(url: string, supabaseUrl: string | undefined): boolean {
  if (!supabaseUrl) return false;
  const prefix = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${IMAGE_BUCKET}/`;
  return url.startsWith(prefix);
}

export function checkImageFile(file: { type: string; size: number }): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "jpg, png, webp, gif 이미지만 올릴 수 있습니다.";
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return "이미지는 5MB 이하만 올릴 수 있습니다.";
  }
  return null;
}

export function imageExtension(type: string): string {
  return extensions[type] ?? "bin";
}
