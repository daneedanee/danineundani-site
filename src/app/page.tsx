import { ConsultSection } from "@/components/danineundani-home/consult-section";
import { PainsSection } from "@/components/danineundani-home/pains-section";
import { ServicesSection } from "@/components/danineundani-home/services-section";
import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";
import { StepsSection } from "@/components/danineundani-home/steps-section";
import { TopBanner } from "@/components/danineundani-home/top-banner";
import { YoutubeBand } from "@/components/danineundani-home/youtube-band";

// 다니는다니 홈페이지: 구역 구성은 docs/홈페이지-기획.md 5·8장.
// 문구는 src/lib/site-content.ts 의 대표 확인 문구만 쓴다.
export default function Home() {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      <main>
        <TopBanner />
        <PainsSection />
        <ServicesSection />
        <StepsSection />
        <YoutubeBand />
        <ConsultSection />
      </main>
      <SiteFooter />
    </div>
  );
}
