import type { Metadata } from "next";

import { DiagnosisView } from "@/components/diagnosis/diagnosis-view";
import { serializeJsonLd } from "@/lib/notes/jsonld";
import { absoluteUrl, siteName, siteUrl } from "@/lib/seo";
import { diagnosisPage, links } from "@/lib/site-content";
import { serviceGraph } from "@/lib/visibility/service";

export const metadata: Metadata = {
  title: `${diagnosisPage.metaTitle} · ${siteName}`,
  description: diagnosisPage.metaDescription,
  alternates: { canonical: absoluteUrl("/diagnosis") },
};

// 블로그 진단 상세페이지 (2026-10-25). 결제는 래피드에서 한다.
// 가격·기간·받는 것은 페이지와 같은 사실(59,000원, 1회, 노션 또는 PDF, 영업일 3~5일)만 쓴다. 결제는 래피드.
const diagnosisJsonLd = serializeJsonLd(
  serviceGraph(siteUrl, {
    path: "/diagnosis",
    name: diagnosisPage.metaTitle,
    description: diagnosisPage.metaDescription,
    serviceType: "블로그 진단",
    offer: { price: 59000, currency: "KRW", url: links.diagnosis },
  }),
);

export default function DiagnosisPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: diagnosisJsonLd }} />
      <DiagnosisView />
    </>
  );
}
