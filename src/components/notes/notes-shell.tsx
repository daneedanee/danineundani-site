import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";

// 게시판 페이지의 틀. 머리와 꼬리는 홈과 같은 것을 쓴다.
// 머리가 화면 위에 고정(높이 80px)이라 본문을 그만큼 내린다.
// 목록(카드 세 칸)은 넓게, 글 본문은 읽기 좋은 폭으로 쓴다.
export function NotesShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      <main className="min-h-screen bg-[#fffaf4] px-5 pt-[120px] pb-24 min-[992px]:pt-[140px]">
        <div className={`mx-auto w-full ${wide ? "max-w-[1140px]" : "max-w-[720px]"}`}>{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
