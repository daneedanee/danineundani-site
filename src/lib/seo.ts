// 사이트 주소와 검색 노출(색인) 스위치.
// 색인을 여닫는 자리는 이 파일 하나다. layout.tsx, robots.ts, sitemap.ts 가 모두 여기를 읽는다.
// 여는 방법: Vercel 환경 변수에 NEXT_PUBLIC_ALLOW_INDEXING=true 를 넣고 다시 배포한다.
// 열지 말지는 대표가 정한다. (CLAUDE.md)
import type { MetadataRoute } from "next";

import { PILLARS, hubPath } from "./notes/topics.ts";

export const siteName = "다니는다니";

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
    { url: absoluteUrl("/notes", base), ...(latest ? { lastModified: new Date(latest) } : {}) },
    // 기둥 허브. 발행 글이 하나 이상 있는 기둥만 넣고, 수정 시각은 넣지 않는다.
    ...PILLARS.filter((pillar) => posts.some((post) => post.pillar === pillar.key)).map((pillar) => ({ url: absoluteUrl(hubPath(pillar.key), base) })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/notes/${post.slug}`, base),
      lastModified: new Date(post.updated_at),
    })),
  ];
}
