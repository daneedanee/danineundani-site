import type { Metadata } from "next";
import "./globals.css";

import { hero } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "다니는다니",
  description: hero.description,
  // 배포 결정 전까지 검색 노출을 막는다.
  robots: { index: false, follow: false },
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
