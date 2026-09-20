"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { links, navItems } from "@/lib/site-content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-[999] border-b border-[#eaded4] bg-[#fffaf4]">
      <div className="h-20 px-4 py-5 min-[992px]:px-5">
        <div className="mx-auto flex h-10 max-w-[1080px] items-center justify-between gap-4">
          <a href="#top" className="shrink-0 text-[20px] font-extrabold tracking-[-0.5px] text-[#2b2421] min-[992px]:text-[24px]">
            다니는<span className="text-[#fd715b]">다니</span>
          </a>

          <nav aria-label="주요 메뉴" className="hidden min-[992px]:block">
            <ul className="flex items-center gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="px-2.5 py-[5px] text-[14px] tracking-[0.25px] text-[#5c514b] hover:text-[#fd715b]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <a
              href={links.kakaoChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-[4px] bg-[#fd715b] px-2.5 py-2.5 text-[12px] leading-3 font-bold text-[#2b2421] shadow-[0_5px_14px_rgba(165,78,56,0.15)] min-[992px]:px-5 min-[992px]:py-3 min-[992px]:text-[16px] min-[992px]:leading-4"
            >
              카카오톡 문의
              <span className="sr-only">(새 탭에서 열림)</span>
            </a>
            <button
              type="button"
              aria-label="메뉴"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex size-12 items-center justify-center text-[#2b2421] min-[992px]:hidden"
            >
              {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav aria-label="모바일 메뉴" className="min-[992px]:hidden">
          <ul className="flex flex-col bg-[#2b2421] px-5 py-2.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-[14px] text-center text-[14px] leading-[22px] tracking-[0.25px] text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
