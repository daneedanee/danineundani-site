// 검색 엔진이 읽는 구조화 데이터(JSON-LD).
import type { Post } from "./types";

export type JsonLdSite = {
  siteName: string;
  siteUrl: string;
  authorName: string;
  authorSameAs: string[];
};

type PostForJsonLd = Pick<Post, "title" | "description" | "cover_image_url" | "published_at" | "updated_at">;

export function blogPostingJsonLd(post: PostForJsonLd, url: string, site: JsonLdSite) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    ...(post.cover_image_url ? { image: [post.cover_image_url] } : {}),
    datePublished: post.published_at ?? post.updated_at,
    dateModified: post.updated_at,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    // 글쓴이는 사람으로 적는다. 퍼스널 브랜드 채널이라 사람과 그 채널들을 잇는 편이 신뢰 평가에 맞다.
    author: { "@type": "Person", name: site.authorName, sameAs: site.authorSameAs },
    publisher: { "@type": "Organization", name: site.siteName, url: site.siteUrl },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// <script> 안에 넣을 문자열. "<" 를 바꿔 두지 않으면 제목에 </script> 가 들어간 글이 태그를 닫아 버린다.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
