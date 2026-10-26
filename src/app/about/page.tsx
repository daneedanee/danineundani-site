import type { Metadata } from "next";

import { AboutView } from "@/components/about/about-view";
import { serializeJsonLd } from "@/lib/notes/jsonld";
import { absoluteUrl, siteName, siteUrl } from "@/lib/seo";
import { aboutPage, author, links } from "@/lib/site-content";
import { aboutGraph } from "@/lib/visibility/about";

export const metadata: Metadata = {
  title: `${aboutPage.metaTitle} · ${siteName}`,
  description: aboutPage.metaDescription,
  alternates: { canonical: absoluteUrl("/about") },
};

// 검색엔진·AI가 다니(사람)와 마켓티브(운영 사업자)를 같은 곳으로 읽게 하는 구조화 데이터. 공개된 정보만 쓴다.
const aboutJsonLd = serializeJsonLd(
  aboutGraph(siteUrl, {
    ...aboutPage.jsonLd,
    description: aboutPage.metaDescription,
    image: aboutPage.hero.photo.src,
    sameAs: [...author.sameAs, links.cafe],
  }),
);

// 소개 페이지 (2026-10-26, 메뉴 "다니는다니는"). 문구는 site-content.ts 의 aboutPage 에 있다.
export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: aboutJsonLd }} />
      <AboutView />
    </>
  );
}
