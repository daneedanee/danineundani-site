import type { Metadata } from "next";

// 관리자 화면은 언제나 검색에서 제외한다.
// 나중에 홈페이지 전체의 검색 차단(layout.tsx의 robots)을 풀더라도 이 설정은 남겨 둔다.
export const metadata: Metadata = {
  title: "관리자 · 다니는다니",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
