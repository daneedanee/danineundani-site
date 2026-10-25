import { ArrowDown } from "lucide-react";

import { hero, sectionIds } from "@/lib/site-content";

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
            <p className="mb-5 text-[12px] font-bold tracking-[0.2em] text-[#fd715b]">{hero.eyebrow}</p>
            <h1 id="hero-heading" className="text-[24px] leading-[34px] font-bold tracking-[-0.5px] text-white break-keep min-[992px]:text-[38px] min-[992px]:leading-[52px]">
              {hero.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            {/* 넓은 화면에서는 대표가 준 줄 나눔대로, 좁은 화면에서는 이어서 자연스럽게 넘긴다. */}
            <p className="mt-4 text-[15px] leading-[24px] font-light text-white/90 break-keep min-[992px]:text-[18px] min-[992px]:leading-[28px]">
              {hero.descriptionLines.map((line) => (
                <span key={line} className="min-[992px]:block">
                  {line}{" "}
                </span>
              ))}
            </p>
            <p className="mt-2 text-[14px] leading-[21px] font-light text-white/60 break-keep min-[992px]:text-[16px]">
              {hero.subDescription}
            </p>
            {/* 주 버튼은 고민 찾기, 진단은 바로 가는 보조 링크 (2026-10-25 대표 결정). */}
            <ExternalButton
              href={`/#${sectionIds.finder}`}
              className="mt-6 rounded-[5px] px-5 py-3 text-[15px] min-[992px]:mt-8 min-[992px]:px-6 min-[992px]:text-[18px]"
            >
              {hero.cta}
              <ArrowDown aria-hidden className="size-4 shrink-0" />
            </ExternalButton>
            <a
              href="/diagnosis"
              className="mt-4 inline-flex items-center gap-1 text-[14px] leading-[21px] text-white/75 underline underline-offset-4 break-keep hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd715b] min-[992px]:text-[15px]"
            >
              {hero.diagnosisLink}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
