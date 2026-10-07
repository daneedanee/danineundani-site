import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";

// 게시판 페이지의 틀. 머리와 꼬리는 홈과 같은 것을 쓴다.
// 머리가 화면 위에 고정(높이 80px)이라 본문을 그만큼 내린다.
export function NotesShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      <main className="min-h-screen bg-[#fffaf4] px-5 pt-[120px] pb-24 min-[992px]:pt-[140px]">
        <div className="mx-auto w-full max-w-[720px]">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
