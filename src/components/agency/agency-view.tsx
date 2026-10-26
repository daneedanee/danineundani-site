import { Check, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container, ExternalButton, SectionTitle, Sentences } from "@/components/danineundani-home/shared";
import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";
import { agencyPage as copy, links } from "@/lib/site-content";

const sectionClass = "px-5 py-14 min-[992px]:px-0 min-[992px]:py-[88px]";
const cardClass = "rounded-[10px] bg-[#fffdf9] shadow-[0_8px_20px_rgba(112,69,48,0.08)]";

function Kakao({ className }: { className: string }) {
  return (
    <a href={links.kakaoChannel} target="_blank" rel="noopener noreferrer" className={className}>
      {copy.hero.kakao}
      <span className="sr-only">(새 탭에서 열림)</span>
    </a>
  );
}

// 블로그 관리 대행 설명 페이지 (2026-10-26). 대표 블로그 글 두 편(5가지 원칙, 대행 진행 과정)으로 짰다.
// 흐름: 누구의 어떤 고민 → 다섯 가지 원칙 → 맡기면 보는 것 → 진행 → 정말 대행이 필요한지 → 신청. 상담 신청서(네이버 폼)는 새 탭으로 연다.
export function AgencyView() {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      <main>
        <section aria-labelledby="agency-heading" className="mt-20 bg-[#2b2421] bg-[radial-gradient(circle_at_80%_30%,rgba(253,113,91,0.3),transparent_45%)]">
          <div className="mx-auto flex max-w-[900px] flex-col items-center px-5 py-16 text-center min-[992px]:min-h-[440px] min-[992px]:justify-center">
            <p className="mb-5 text-[12px] font-bold tracking-[0.2em] text-[#fd715b]">{copy.hero.eyebrow}</p>
            <h1 id="agency-heading" className="text-[26px] leading-[36px] font-bold tracking-[-0.5px] text-white break-keep min-[992px]:text-[38px] min-[992px]:leading-[52px]">
              {copy.hero.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-4 max-w-[640px] text-[15px] leading-[24px] font-light text-white/90 break-keep min-[992px]:text-[17px] min-[992px]:leading-[28px]">
              <Sentences text={copy.hero.description} />
            </p>
            <ExternalButton href={copy.hero.ctaHref} className="mt-6 rounded-[5px] px-6 py-3 text-[16px] min-[992px]:text-[18px]">
              {copy.hero.cta}
            </ExternalButton>
            <Kakao className="mt-4 text-[14px] leading-[21px] text-white/75 underline underline-offset-4 hover:text-white" />
          </div>
        </section>

        {/* 누구의: 이런 대표님께 */}
        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex max-w-[860px] flex-col gap-6 min-[992px]:flex-row min-[992px]:items-center min-[992px]:gap-10">
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="text-[20px] leading-[30px] font-extrabold tracking-[-0.5px] text-[#191919] break-keep min-[992px]:text-[24px] min-[992px]:leading-[36px]">{copy.fit.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {copy.fit.items.map((item) => (
                  <li key={item} className={`${cardClass} flex gap-3 p-4`}>
                    <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-[#fd715b]" />
                    <span className="text-[15px] leading-[24px] text-[#2b2421] break-keep">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Image src="/images/danineundani/service-agency.webp" alt="" width={360} height={360} unoptimized className="mx-auto w-full max-w-[320px] rounded-[10px] min-[992px]:max-w-[340px]" />
          </Container>
        </section>

        {/* 어떤 고민 */}
        <section className={`${sectionClass} bg-[#fbf7f2]`}>
          <Container className="flex max-w-[760px] flex-col gap-6">
            <SectionTitle title={copy.worries.title} subtitle={copy.worries.lead} />
            <ul className="grid gap-3 min-[992px]:grid-cols-2">
              {copy.worries.quotes.map((quote) => (
                <li key={quote} className={`${cardClass} flex gap-3 p-4`}>
                  <MessageCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-[#c9412f]" />
                  <span className="text-[15px] leading-[24px] text-[#2b2421] break-keep">&ldquo;{quote}&rdquo;</span>
                </li>
              ))}
            </ul>
            <p className="rounded-[10px] bg-[#2b2421] p-5 text-center text-[16px] leading-[26px] font-bold text-white break-keep">
              <Sentences text={copy.worries.answer} />
            </p>
          </Container>
        </section>

        {/* 어떻게 다른지: 다섯 가지 원칙 */}
        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex max-w-[760px] flex-col gap-6">
            <SectionTitle title={copy.principles.title} />
            <ol className="flex flex-col gap-3">
              {copy.principles.items.map((item, index) => (
                <li key={item.title} className={`${cardClass} flex gap-4 p-5`}>
                  <span aria-hidden className="text-[22px] leading-[28px] font-extrabold text-[#fd715b]">
                    {index + 1}
                  </span>
                  <div className="break-keep">
                    <h3 className="text-[16px] leading-[24px] font-bold text-[#191919]">{item.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-[23px] text-[#5f6368]">
                      <Sentences text={item.text} />
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="rounded-[10px] border-l-4 border-[#fd715b] bg-[#fffdf9] px-5 py-4 text-[15px] leading-[25px] font-semibold text-[#191919] break-keep">
              <Sentences text={copy.principles.direct} />
            </p>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fbf7f2]`}>
          <Container className="flex max-w-[760px] flex-col items-center gap-5 text-center">
            <SectionTitle title={copy.scope.title} subtitle={copy.scope.text} />
            <ul className="flex flex-wrap justify-center gap-2">
              {copy.scope.chips.map((chip) => (
                <li key={chip} className="rounded-full bg-[#2b2421] px-4 py-2 text-[14px] font-semibold text-[#fffdf9]">
                  {chip}
                </li>
              ))}
            </ul>
            <p className="max-w-[600px] text-[14px] leading-[22px] text-[#8a8178] break-keep">
              <Sentences text={copy.scope.industries} />
            </p>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex max-w-[760px] flex-col gap-6">
            <SectionTitle title={copy.process.title} />
            <ol className="flex flex-col gap-3">
              {copy.process.steps.map((step, index) => (
                <li key={step.title} className={`${cardClass} flex gap-4 p-5`}>
                  <span aria-hidden className="text-[22px] leading-[28px] font-extrabold text-[#fd715b]">
                    {index + 1}
                  </span>
                  <div className="break-keep">
                    <h3 className="text-[16px] leading-[24px] font-bold text-[#191919]">{step.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-[23px] text-[#5f6368]">
                      <Sentences text={step.text} />
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-2 rounded-[10px] border border-[#f0d9c8] bg-[#fffdf9] p-4 text-[14px] leading-[22px] text-[#5f6368] break-keep">
              <p className="font-semibold text-[#2b2421]">
                <Sentences text={copy.process.note} />
              </p>
              <p>
                <Sentences text={copy.note} />
              </p>
            </div>
          </Container>
        </section>

        {/* 직접 하실 분 */}
        <section className={`${sectionClass} bg-[#fbf7f2]`}>
          <Container className="max-w-[760px]">
            <div className={`${cardClass} flex flex-col items-start gap-3 p-6`}>
              <h2 className="text-[18px] leading-[27px] font-bold text-[#191919] break-keep">{copy.selfCheck.title}</h2>
              <p className="text-[14px] leading-[23px] text-[#5f6368] break-keep">
                <Sentences text={copy.selfCheck.text} />
              </p>
              <div className="mt-1 flex flex-col gap-2">
                {copy.selfCheck.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-[14px] font-semibold text-[#2b2421] underline decoration-[#fd715b] decoration-2 underline-offset-4 hover:text-[#c9412f] break-keep">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#2b2421]`}>
          <Container className="flex flex-col items-center gap-4 text-center">
            <h2 className="max-w-[640px] text-[22px] leading-[32px] font-bold text-white break-keep min-[992px]:text-[28px] min-[992px]:leading-[40px]">{copy.closing.title}</h2>
            <p className="max-w-[560px] text-[15px] leading-[24px] text-white/85 break-keep">
              <Sentences text={copy.closing.description} />
            </p>
            <ExternalButton href={copy.hero.ctaHref} className="rounded-[5px] px-6 py-3 text-[16px]">
              {copy.hero.cta}
            </ExternalButton>
            <Kakao className="text-[14px] text-white/75 underline underline-offset-4 hover:text-white" />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
