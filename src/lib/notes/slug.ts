// 글 주소(slug). 한글을 그대로 쓸 수 있다.
export const SLUG_MAX = 120;

// /notes/page/2 와 헷갈리지 않게 막아 둔 이름.
const reserved = new Set(["page"]);
const shape = /^[a-z0-9가-힣]+(?:-[a-z0-9가-힣]+)*$/;

export function slugify(title: string): string {
  return title
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-$/, "");
}

export function isValidSlug(slug: string): boolean {
  return slug.length <= SLUG_MAX && shape.test(slug) && !reserved.has(slug);
}

// 주소에서 받은 값을 글 주소로 바꾼다. 한글 주소는 %EB%B8%94… 로 인코딩돼 들어올 수 있고,
// 맥에서 붙여넣은 한글은 자모가 풀린 채(NFD) 올 수 있다. 둘 다 여기서 맞춘다.
export function decodeSlugParam(raw: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const normalized = decoded.normalize("NFC");
  return isValidSlug(normalized) ? normalized : null;
}
