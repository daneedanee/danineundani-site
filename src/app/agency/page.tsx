import type { Metadata } from "next";

import { AgencyView } from "@/components/agency/agency-view";
import { absoluteUrl, siteName } from "@/lib/seo";
import { embeds } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `${embeds.agency.title} · ${siteName}`,
  alternates: { canonical: absoluteUrl("/agency") },
};

// 설명은 홈페이지 톤으로, 신청만 바깥 도구로 (2026-10-26 대표).
export default function AgencyPage() {
  return <AgencyView />;
}
