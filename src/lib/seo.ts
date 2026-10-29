// 사이트 주소와 검색 노출(색인) 스위치.
// 색인을 여닫는 자리는 이 파일 하나다. layout.tsx, robots.ts, sitemap.ts 가 모두 여기를 읽는다.
// 여는 방법: Vercel 환경 변수에 NEXT_PUBLIC_ALLOW_INDEXING=true 를 넣고 다시 배포한다.
// 열지 말지는 대표가 정한다. (CLAUDE.md)
import type { MetadataRoute } from "next";

import { BLOG_PATH } from "./notes/paths.ts";
import { PILLARS, hubPath } from "./notes/topics.ts";

export const siteName = "다니는다니";

// 링크를 붙여 넣었을 때 뜨는 기본 미리보기 그림 (2026-10-27 대표 요청: 프로필 사진으로).
// og:image 가 없으면 카카오톡이 본문 그림을 아무거나 골라 진단 썸네일이 떴다. 카카오가 webp 를 못 읽을 수 있어 JPG 로 둔다.
// 대표 이미지가 있는 블로그 글은 그 그림을 쓴다.
export const defaultOgImage = { url: "/images/og/dani-profile.jpg", width: 640, height: 640, alt: "다니는다니 대표 다니" };

const defaultSiteUrl = "https://www.daneedanee.com";

export function resolveSiteUrl(value: string | undefined): string {
  const trimmed = value?.trim().replace(/\/+$/, "");
  return trimmed ? trimmed : defaultSiteUrl;
}

export function isIndexingAllowed(value: string | undefined): boolean {
  return value?.trim() === "true";
}

export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const allowIndexing = isIndexingAllowed(process.env.NEXT_PUBLIC_ALLOW_INDEXING);

// canonical · 사이트맵 · JSON-LD 의 주소는 모두 이것으로 만든다. 한글 경로는 여기서 인코딩된다.
export function absoluteUrl(path: string, base: string = siteUrl): string {
  return new URL(path, `${base}/`).toString();
}

export function robotsMeta(allow: boolean): { index: boolean; follow: boolean } {
  return { index: allow, follow: allow };
}

// 꺼진 동안에도 크롤링 자체는 막지 않는다. 막으면 검색 로봇이 noindex 를 읽지 못해서
// 다른 곳에 걸린 링크만으로 주소가 색인될 수 있다. 막는 일은 noindex 메타가 한다.
export function robotsFor(allow: boolean, base: string = siteUrl): MetadataRoute.Robots {
  if (!allow) {
    return { rules: { userAgent: "*", allow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: absoluteUrl("/sitemap.xml", base),
  };
}

export function sitemapFor(
  allow: boolean,
  posts: { slug: string; updated_at: string; pillar?: string | null }[],
  base: string = siteUrl,
): MetadataRoute.Sitemap {
  if (!allow) return [];

  const latest = posts.reduce<string | null>(
    (max, post) => (max === null || post.updated_at > max ? post.updated_at : max),
    null,
  );

  return [
    { url: absoluteUrl("/", base) },
    // 블로그 진단 상세페이지 (2026-10-25). 결제는 래피드에서 한다.
    { url: absoluteUrl("/diagnosis", base) },
    // 소개 페이지 (2026-10-26). 메뉴 이름은 "다니는다니는".
    { url: absoluteUrl("/about", base) },
    // 블로그 대행 문의와 다니레터 (2026-10-29). 처음부터 빠져 있어 구글에는 10/14 noindex 때 기록만 남아 있었다.
    // 개인정보처리방침 /privacy 는 검색으로 찾을 페이지가 아니라 넣지 않는다.
    { url: absoluteUrl("/agency", base) },
    { url: absoluteUrl("/letter", base) },
    { url: absoluteUrl(BLOG_PATH, base), ...(latest ? { lastModified: new Date(latest) } : {}) },
    // 기둥 허브. 발행 글이 하나 이상 있는 기둥만 넣고, 수정 시각은 넣지 않는다.
    ...PILLARS.filter((pillar) => posts.some((post) => post.pillar === pillar.key)).map((pillar) => ({ url: absoluteUrl(hubPath(pillar.key), base) })),
    ...posts.map((post) => ({
      url: absoluteUrl(`${BLOG_PATH}/${post.slug}`, base),
      lastModified: new Date(post.updated_at),
    })),
  ];
}
