import { SiteHeader } from "@/components/danineundani-home/site-header";
import { embeds } from "@/lib/site-content";

// 바깥 서비스의 페이지(스티비 구독, 네이버 폼)를 상단 메뉴 아래에 끼워서 보여 준다.
// 방문자가 홈페이지를 떠나지 않고 신청할 수 있다.
//
// 상대 사이트가 끼워 넣기를 막으면 이 자리가 빈 화면이 된다 (2026-10-11 기준으로는 둘 다 허용).
// 그때를 대비해 「새 창에서 열기」 링크를 언제나 위에 둔다.
// 결제가 들어가는 페이지(래피드)는 여기에 넣지 않는다. 끼워 넣은 화면에서는 결제창이 막히는 일이 흔하다.
export function EmbedPage({ src, title }: { src: string; title: string }) {
  return (
    <div className="flex h-dvh flex-col text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      {/* 머리가 화면 위에 고정(높이 80px)이라 그만큼 내린다. 나머지 높이는 끼워 넣은 페이지가 다 쓴다. */}
      <main className="flex min-h-0 flex-1 flex-col bg-[#fffaf4] pt-20">
        <p className="flex shrink-0 items-center justify-end gap-2 border-b border-[#eaded4] px-5 py-2 text-[13px] text-[#5c514b]">
          {embeds.fallbackHint}
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#2b2421] underline decoration-[#fd715b] decoration-2 underline-offset-4"
          >
            {embeds.openInNewTab}
            <span className="sr-only">(새 탭에서 열림)</span>
          </a>
        </p>
        <iframe src={src} title={title} className="min-h-0 w-full flex-1 border-0 bg-white" />
      </main>
    </div>
  );
}
