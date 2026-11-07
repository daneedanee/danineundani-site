import type { Metadata } from "next";

import { AgencyView } from "@/components/agency/agency-view";
import { serializeJsonLd } from "@/lib/notes/jsonld";
import { absoluteUrl, siteName, siteUrl } from "@/lib/seo";
import { agencyPage, embeds } from "@/lib/site-content";
import { faqGraph, serviceGraph } from "@/lib/visibility/service";

export const metadata: Metadata = {
  title: `${embeds.agency.title} · ${siteName}`,
  description: agencyPage.metaDescription,
  alternates: { canonical: absoluteUrl("/agency") },
};

// 설명은 홈페이지 톤으로, 신청만 바깥 도구로 (2026-10-26 대표).
// 가격은 "문의"라 넣지 않는다.
const agencyJsonLd = serializeJsonLd(
  serviceGraph(siteUrl, {
    path: "/agency",
    name: "블로그 관리 대행 (마켓티브)",
    description: agencyPage.metaDescription,
    serviceType: "블로그 관리 대행",
  }),
);
// 화면의 자주 묻는 질문과 같은 내용 (2026-11-07).
const agencyFaqJsonLd = serializeJsonLd(faqGraph(agencyPage.faq.items));

export default function AgencyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: agencyJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: agencyFaqJsonLd }} />
      <AgencyView />
    </>
  );
}
