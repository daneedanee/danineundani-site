import type { Metadata } from "next";

// 편집 툴은 대표 혼자 쓰는 도구라 언제나 검색에서 제외한다.
export const metadata: Metadata = {
  title: "쇼츠 편집기 · 다니는다니",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
