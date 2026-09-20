import { footer, links } from "@/lib/site-content";

// 구역 9: 푸터 (사업자 정보는 사업자등록증 기준)
export function SiteFooter() {
  return (
    <footer className="bg-black px-5 pt-12 pb-14 min-[992px]:pt-[72px] min-[992px]:pb-[60px]">
      <div className="mx-auto flex max-w-[700px] flex-col gap-6">
        <p className="text-[22px] font-extrabold tracking-[-0.5px] text-white">
          다니는<span className="text-[#fd715b]">다니</span>
        </p>
        <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
          <p className="text-[16px] font-bold text-white">{footer.brands}</p>
          <nav aria-label="외부 채널" className="flex flex-wrap gap-x-4 gap-y-2 text-[14px] leading-[21px] font-light text-[#a5a5a5]">
            <a href={links.kakaoChannel} target="_blank" rel="noopener noreferrer" className="underline decoration-[#fd715b] underline-offset-4">
              {footer.kakao}
              <span className="sr-only">(새 탭에서 열림)</span>
            </a>
            <a href={links.threads} target="_blank" rel="noopener noreferrer" className="underline decoration-[#fd715b] underline-offset-4">
              스레드
              <span className="sr-only">(새 탭에서 열림)</span>
            </a>
            <a href={links.youtubeChannel} target="_blank" rel="noopener noreferrer" className="underline decoration-[#fd715b] underline-offset-4">
              유튜브
              <span className="sr-only">(새 탭에서 열림)</span>
            </a>
            <a href={links.blog} target="_blank" rel="noopener noreferrer" className="underline decoration-[#fd715b] underline-offset-4">
              블로그
              <span className="sr-only">(새 탭에서 열림)</span>
            </a>
          </nav>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-[12px] leading-[20px] text-[#a5a5a5]">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 break-keep">
            {footer.businessInfo.map((item) => (
              <li key={item.label}>
                {item.label}: {item.value}
              </li>
            ))}
            <li>
              이메일:{" "}
              <a href={`mailto:${footer.email}`} className="underline decoration-[#fd715b] underline-offset-2 hover:text-white">
                {footer.email}
              </a>
            </li>
          </ul>
          <p className="mt-2 text-[11px] font-extralight">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
