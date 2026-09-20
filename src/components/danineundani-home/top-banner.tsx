import { hero, links } from "@/lib/site-content";

import { ExternalButton } from "./shared";

export function TopBanner() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="mt-20 bg-[#2b2421] bg-[radial-gradient(circle_at_80%_30%,rgba(253,113,91,0.3),transparent_45%)]"
    >
      <div className="bg-[linear-gradient(110deg,rgba(43,36,33,0.98),rgba(67,43,37,0.92))]">
        <div className="mx-auto flex max-w-[900px] flex-col items-center px-5 pt-16 pb-16 text-center min-[992px]:min-h-[500px] min-[992px]:justify-center min-[992px]:px-10">
          <div className="flex max-w-[680px] flex-col items-center">
            <p className="mb-5 text-[12px] font-bold tracking-[0.2em] text-[#fd715b]">DANINEUNDANI · MARKTIVE</p>
            <h1 id="hero-heading" className="max-w-[560px] text-[24px] leading-[34px] font-bold tracking-[-0.5px] text-white break-keep min-[992px]:text-[38px] min-[992px]:leading-[52px]">
              {hero.title}
            </h1>
            <p className="mt-4 max-w-[520px] text-[15px] leading-[24px] font-light text-white/90 break-keep min-[992px]:text-[18px] min-[992px]:leading-[28px]">
              {hero.description}
            </p>
            <p className="mt-2 text-[14px] leading-[21px] font-light text-white/60 break-keep min-[992px]:text-[16px]">
              {hero.subDescription}
            </p>
            <ExternalButton href={links.diagnosis} className="mt-6 rounded-[5px] px-5 py-3 text-[15px] min-[992px]:mt-8 min-[992px]:px-6 min-[992px]:text-[18px]">
              {hero.cta}
            </ExternalButton>
          </div>
        </div>
      </div>
    </section>
  );
}
