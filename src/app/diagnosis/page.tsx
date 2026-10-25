import type { Metadata } from "next";

import { DiagnosisView } from "@/components/diagnosis/diagnosis-view";
import { absoluteUrl, siteName } from "@/lib/seo";
import { diagnosisPage } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `${diagnosisPage.metaTitle} · ${siteName}`,
  description: diagnosisPage.metaDescription,
  alternates: { canonical: absoluteUrl("/diagnosis") },
};

// 블로그 진단 상세페이지 (2026-10-25). 결제는 래피드에서 한다.
export default function DiagnosisPage() {
  return <DiagnosisView />;
}
