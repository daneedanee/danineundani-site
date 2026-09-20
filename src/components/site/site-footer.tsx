import { footer, links } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="bg-ink px-5 py-10 text-white">
      <div className="mx-auto flex max-w-[960px] flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
        <p className="font-bold">{footer.brands}</p>
        <a
          href={links.kakaoChannel}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline decoration-coral decoration-2 underline-offset-4"
        >
          {footer.kakao}
          <span className="sr-only">(새 탭에서 열림)</span>
        </a>
        <p className="text-white/70">{footer.copyright}</p>
      </div>
    </footer>
  );
}
