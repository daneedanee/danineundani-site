import type { Metadata } from "next";
import "./globals.css";

import { allowIndexing, robotsMeta, siteName, siteUrl } from "@/lib/seo";
import { hero } from "@/lib/site-content";

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
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
