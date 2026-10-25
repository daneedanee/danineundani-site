import type { Metadata } from "next";

import { ConsultSection } from "@/components/danineundani-home/consult-section";
import { HomeReviews } from "@/components/danineundani-home/home-reviews";
import { ProblemFinder } from "@/components/danineundani-home/problem-finder";
import { ServicesSection } from "@/components/danineundani-home/services-section";
import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";
import { TopBanner } from "@/components/danineundani-home/top-banner";
import { WorkbookBand } from "@/components/danineundani-home/workbook-band";
import { YoutubeBand } from "@/components/danineundani-home/youtube-band";
import { serializeJsonLd } from "@/lib/notes/jsonld";
import { siteName, siteUrl } from "@/lib/seo";
import { footer, hero, links } from "@/lib/site-content";
import { brandGraph } from "@/lib/visibility/brand";

// 검색엔진에 알려 주는 사이트·운영 사업자 정보(WebSite·Organization). 새 사실을 만들지 않고 이미 공개된 정보만 쓴다.
const brandJsonLd = serializeJsonLd(
  brandGraph(siteUrl, { name: siteName, business: footer.businessInfo[0].value, email: footer.email, description: hero.description, blog: links.blog }),
);

// 홈의 대표 주소. metadataBase(layout.tsx)와 합쳐져 https://www.daneedanee.com/ 이 된다.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// 다니는다니 홈페이지: 구역 구성은 docs/홈페이지-기획.md 5·8장.
// 2026-10-24 고민 선택형 구조로 바꿈: 고민 구역·시작 순서 구역 대신 고민 찾기(질문 → 맞춤 추천)를 첫 화면 바로 아래에 둔다.
// 2026-10-26: 고민 찾기 아래 진단 후기, 서비스 카드는 유튜브 띠 아래로 내려 "바로 고르고 싶다면" 목차로 짧게.
// 문구는 src/lib/site-content.ts 에만 둔다.
export default function Home() {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: brandJsonLd }} />
      <SiteHeader />
      <main>
        <TopBanner />
        <ProblemFinder />
        <HomeReviews />
        <YoutubeBand />
        <ServicesSection />
        <WorkbookBand />
        <ConsultSection />
      </main>
      <SiteFooter />
    </div>
  );
}
