import type { Metadata } from "next";
import { Gowun_Dodum } from "next/font/google";
import "./globals.css";

import { SiteMeasurement } from "@/components/visibility/site-measurement";
import { allowIndexing, defaultOgImage, robotsMeta, siteName, siteUrl } from "@/lib/seo";
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
  // 미리보기 기본값. 제목과 설명은 넣지 않는다 - 넣으면 모든 페이지 미리보기가 같은 제목이 된다(없으면 페이지 <title> 을 쓴다).
  // 페이지가 openGraph 를 따로 두면 이 값이 통째로 바뀌므로, 그런 페이지(블로그 목록·허브·글)는 그림을 따로 넣는다.
  openGraph: { type: "website", siteName, locale: "ko_KR", images: [defaultOgImage] },
  twitter: { card: "summary", images: [defaultOgImage.url] },
  // 네이버 서치어드바이저 사이트 소유 확인 (2026-10-26, 로그인 계정 marktive). 지우면 소유 확인이 풀린다.
  // 구글 서치 콘솔은 도메인(DNS)으로 확인돼 여기 태그가 필요 없다.
  verification: { other: { "naver-site-verification": "a453970c084643394b36ce65fec21a15a7f49f0a" } },
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
