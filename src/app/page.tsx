import type { Metadata } from "next";

import { ConsultSection } from "@/components/danineundani-home/consult-section";
import { ProblemFinder } from "@/components/danineundani-home/problem-finder";
import { ServicesSection } from "@/components/danineundani-home/services-section";
import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";
import { TopBanner } from "@/components/danineundani-home/top-banner";
import { WorkbookBand } from "@/components/danineundani-home/workbook-band";
import { YoutubeBand } from "@/components/danineundani-home/youtube-band";

// 홈의 대표 주소. metadataBase(layout.tsx)와 합쳐져 https://www.daneedanee.com/ 이 된다.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// 다니는다니 홈페이지: 구역 구성은 docs/홈페이지-기획.md 5·8장.
// 2026-10-24 고민 선택형 구조로 바꿈: 고민 구역·시작 순서 구역 대신 고민 찾기(질문 → 맞춤 추천)를 첫 화면 바로 아래에 둔다.
// 서비스 카드는 고민 찾기 없이 바로 고르려는 사람을 위해 그대로 둔다.
// 문구는 src/lib/site-content.ts 에만 둔다.
export default function Home() {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      <main>
        <TopBanner />
        <ProblemFinder />
        <ServicesSection />
        <YoutubeBand />
        <WorkbookBand />
        <ConsultSection />
      </main>
      <SiteFooter />
    </div>
  );
}
