import type { Metadata } from "next";
import { Gowun_Dodum } from "next/font/google";
import "./globals.css";

import { SiteMeasurement } from "@/components/visibility/site-measurement";
import { allowIndexing, robotsMeta, siteName, siteUrl } from "@/lib/seo";
import { hero } from "@/lib/site-content";

// 고운돋움(OFL). 빌드할 때 내려받아 우리 사이트에서 직접 내준다.
// 한글은 여러 조각으로 나뉘어 있어서, 방문자는 화면에 나온 글자가 든 조각만 받는다.
const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gowun",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteName,
  description: hero.description,
  // 검색 노출은 src/lib/seo.ts 의 스위치를 따른다. 대표가 열라고 할 때까지 꺼 둔다.
  robots: robotsMeta(allowIndexing),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${gowunDodum.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        {/* 방문·클릭 횟수 측정. NEXT_PUBLIC_VISIBILITY_MEASUREMENT=true 일 때만 보낸다 (supabase/08-visibility-events.sql). */}
        <SiteMeasurement />
      </body>
    </html>
  );
}
