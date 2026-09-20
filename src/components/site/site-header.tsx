import { links, navItems } from "@/lib/site-content";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 md:h-[72px]">
        <a href="#top" className="text-xl font-extrabold tracking-tight text-ink md:text-2xl">
          다니는<span className="text-coral-deep">다니</span>
        </a>

        <nav aria-label="주요 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-sm font-medium text-ink hover:text-coral-deep">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={links.diagnosis}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center rounded-full border-2 border-ink bg-coral px-4 text-sm font-bold text-ink md:h-10 md:px-5 md:text-[15px]"
        >
          블로그 진단 신청
          <span className="sr-only">(새 탭에서 열림)</span>
        </a>
      </div>
    </header>
  );
}
