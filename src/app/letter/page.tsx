import type { Metadata } from "next";

import { LetterView } from "@/components/letter/letter-view";
import { absoluteUrl, siteName } from "@/lib/seo";
import { embeds } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `${embeds.letter.title} · ${siteName}`,
  alternates: { canonical: absoluteUrl("/letter") },
};

// 설명은 홈페이지 톤으로, 신청만 바깥 도구로 (2026-10-26 대표).
export default function LetterPage() {
  return <LetterView />;
}
