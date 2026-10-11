import type { Metadata } from "next";

import { EmbedPage } from "@/components/embed/embed-page";
import { absoluteUrl, siteName } from "@/lib/seo";
import { embeds, links } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `${embeds.agency.title} · ${siteName}`,
  alternates: { canonical: absoluteUrl("/agency") },
};

// 블로그 대행 상담 신청. 네이버 폼을 메뉴 아래에 끼워 보여 준다.
export default function AgencyPage() {
  return <EmbedPage src={links.agencyFormDirect} title={embeds.agency.frameTitle} />;
}
