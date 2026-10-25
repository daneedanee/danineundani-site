import type { Metadata } from "next";

import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";
import { absoluteUrl, siteName } from "@/lib/seo";
import { privacyPolicy } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `${privacyPolicy.title} · ${siteName}`,
  description: `${siteName}(마켓티브) 홈페이지의 개인정보처리방침입니다.`,
  alternates: { canonical: absoluteUrl("/privacy") },
};

// 개인정보처리방침 (2026-10-26). 문구는 site-content.ts 의 privacyPolicy 한 곳에 있다.
export default function PrivacyPage() {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      <main className="mt-20 bg-[#fbf7f2] px-5 py-14 min-[992px]:py-[88px]">
        <article className="mx-auto flex max-w-[760px] flex-col gap-8 rounded-[10px] bg-white p-6 min-[992px]:p-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-[24px] leading-[34px] font-extrabold tracking-[-0.5px] text-[#191919]">{privacyPolicy.title}</h1>
            <p className="text-[13px] text-[#8a8178]">시행일: {privacyPolicy.effectiveDate}</p>
            <p className="mt-2 text-[15px] leading-[25px] text-[#2b2421] break-keep">{privacyPolicy.intro}</p>
          </header>
          {privacyPolicy.sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-2">
              <h2 className="text-[17px] leading-[26px] font-bold text-[#191919]">{section.title}</h2>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-[23px] text-[#4b4540] marker:text-[#c9412f]">
                {section.items.map((item) => (
                  <li key={item} className="break-keep">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
