import type { Metadata } from "next";

import { EmbedPage } from "@/components/embed/embed-page";
import { absoluteUrl, siteName } from "@/lib/seo";
import { embeds, links } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `${embeds.letter.title} · ${siteName}`,
  alternates: { canonical: absoluteUrl("/letter") },
};

// 다니레터(뉴스레터) 구독 신청. 스티비의 구독 페이지를 메뉴 아래에 끼워 보여 준다.
export default function LetterPage() {
  return <EmbedPage src={links.newsletter} title={embeds.letter.frameTitle} />;
}
