import { Check, ChevronDown } from "lucide-react";
import Image from "next/image";

import { Container, ExternalButton, SectionTitle } from "@/components/danineundani-home/shared";
import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";
import { diagnosisPage as copy, links, offers } from "@/lib/site-content";

const sectionClass = "px-5 py-14 min-[992px]:px-0 min-[992px]:py-[88px]";

// 블로그 진단 상세페이지. 설명은 여기서 하고 결제는 래피드(새 탭)에서 한다.
// 문구는 site-content.ts 의 diagnosisPage 에 있다.
export function DiagnosisView() {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      <main>
        <section aria-labelledby="diagnosis-heading" className="mt-20 bg-[#2b2421] bg-[radial-gradient(circle_at_80%_30%,rgba(253,113,91,0.3),transparent_45%)]">
          <div className="mx-auto flex max-w-[900px] flex-col items-center px-5 py-16 text-center min-[992px]:min-h-[440px] min-[992px]:justify-center">
            <p className="mb-5 text-[12px] font-bold tracking-[0.2em] text-[#fd715b]">{copy.hero.eyebrow}</p>
            <h1 id="diagnosis-heading" className="text-[24px] leading-[34px] font-bold tracking-[-0.5px] text-white break-keep min-[992px]:text-[36px] min-[992px]:leading-[50px]">
              {copy.hero.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-4 max-w-[620px] text-[15px] leading-[24px] font-light text-white/90 break-keep min-[992px]:text-[17px] min-[992px]:leading-[28px]">
              {copy.hero.description}
            </p>
            <p className="mt-5 text-[22px] leading-[30px] font-extrabold text-white">{offers.diagnosis.price}</p>
            <ExternalButton href={links.diagnosis} className="mt-5 rounded-[5px] px-6 py-3 text-[16px] min-[992px]:text-[18px]">
              {copy.hero.cta}
            </ExternalButton>
            <a
              href="#diagnosis-includes"
              className="mt-4 inline-flex items-center gap-1 text-[14px] leading-[21px] text-white/75 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd715b]"
            >
              {copy.hero.secondary}
              <ChevronDown aria-hidden className="size-4" />
            </a>
          </div>
        </section>

        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex max-w-[680px] flex-col gap-6">
            <SectionTitle title={copy.checklist.title} />
            <ul className="flex flex-col gap-2.5">
              {copy.checklist.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 rounded-[8px] bg-white px-4 py-3 text-[15px] leading-[22px] text-[#2b2421] break-keep">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-[#c9412f]" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-center text-[15px] leading-[24px] font-semibold text-[#2b2421] break-keep">{copy.checklist.closing}</p>
          </Container>
        </section>

        <section id="diagnosis-includes" className={`${sectionClass} bg-[#fbf7f2]`}>
          <Container className="flex flex-col gap-6">
            <SectionTitle title={copy.includes.title} />
            <ol className="grid gap-3 min-[992px]:grid-cols-2 min-[992px]:gap-4">
              {copy.includes.items.map((item, index) => (
                <li key={item.title} className="rounded-[10px] bg-[#fffdf9] p-5 shadow-[0_8px_20px_rgba(112,69,48,0.08)]">
                  <p className="text-[12px] leading-4 font-bold text-[#c9412f]">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 text-[17px] leading-[26px] font-bold text-[#191919] break-keep">{item.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[22px] text-[#5f6368] break-keep">{item.text}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section id="diagnosis-sample" className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex flex-col gap-6">
            <SectionTitle title={copy.sample.title} subtitle={copy.sample.description} />
            <div className="grid gap-4 min-[992px]:grid-cols-[300px_1fr] min-[992px]:items-start min-[992px]:gap-6">
              <div className="rounded-[10px] bg-white p-5">
                <h3 className="text-[15px] leading-[22px] font-bold text-[#191919]">{copy.sample.tocTitle}</h3>
                <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-[13px] leading-[20px] text-[#5f6368] marker:text-[#c9412f]">
                  {copy.sample.toc.map((item) => (
                    <li key={item} className="break-keep">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
              {copy.sample.images.length > 0 && (
                <div className="flex flex-col gap-5">
                  {copy.sample.images.map((image) => (
                    <figure key={image.src} className="overflow-hidden rounded-[10px] border border-[#eaded4] bg-white">
                      {/* 모바일에서는 글자가 작아서 누르면 원본 크기로 연다. */}
                      <a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`${image.caption} (${copy.sample.zoomHint}, 새 탭)`}>
                        <Image src={image.src} alt={image.caption} width={image.width} height={image.height} className="h-auto w-full" />
                      </a>
                      <figcaption className="flex flex-col gap-1 border-t border-[#eaded4] px-4 py-3 text-[13px] leading-[20px] text-[#5f6368] break-keep">
                        {image.caption}
                        <span className="text-[12px] text-[#8a8178]">{copy.sample.zoomHint}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fbf7f2]`}>
          <Container className="flex max-w-[760px] flex-col gap-6">
            <SectionTitle title={copy.process.title} />
            <ol className="flex flex-col gap-3">
              {copy.process.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4 rounded-[10px] bg-white p-5">
                  <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fd715b] text-[14px] font-bold text-black">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[16px] leading-6 font-bold text-[#191919]">{step.title}</h3>
                    <p className="mt-1 text-[14px] leading-[22px] text-[#5f6368] break-keep">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex flex-col gap-6">
            <SectionTitle title={copy.reviews.title} subtitle={copy.reviews.note} />
            <div className="grid gap-4 min-[992px]:grid-cols-2 min-[992px]:items-start">
              {copy.reviews.captures.map((capture) => (
                <figure key={capture.src} className="overflow-hidden rounded-[10px] border border-[#eaded4] bg-white">
                  <a href={capture.src} target="_blank" rel="noopener noreferrer" aria-label={`카카오톡 후기 캡처 (${copy.sample.zoomHint}, 새 탭)`}>
                    <Image src={capture.src} alt={`카카오톡 후기 캡처: ${capture.quote}`} width={capture.width} height={capture.height} className="h-auto w-full" />
                  </a>
                  <figcaption className="flex flex-col gap-1.5 border-t border-[#eaded4] px-4 py-3 break-keep">
                    <span className="text-[14px] leading-[22px] text-[#2b2421]">&ldquo;{capture.quote}&rdquo;</span>
                    <span className="text-[12px] leading-[18px] text-[#8a8178]">{capture.caption}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <ul className="grid gap-3 min-[992px]:grid-cols-2 min-[992px]:gap-4">
              {copy.reviews.items.map((review) => (
                <li key={review.text} className="flex flex-col justify-between gap-3 rounded-[10px] bg-[#fffdf9] p-5 shadow-[0_8px_20px_rgba(112,69,48,0.08)]">
                  <blockquote className="text-[15px] leading-[24px] text-[#2b2421] break-keep">&ldquo;{review.text}&rdquo;</blockquote>
                  <p className="text-[12px] leading-[18px] text-[#8a8178]">{review.source}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fbf7f2]`}>
          <Container className="grid max-w-[900px] gap-6 min-[992px]:grid-cols-2 min-[992px]:gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-[20px] leading-[30px] font-extrabold tracking-[-0.5px] text-[#191919] min-[992px]:text-[24px] min-[992px]:leading-[36px]">{copy.terms.title}</h2>
              <dl className="flex flex-col divide-y divide-[#eaded4] rounded-[10px] bg-white px-5">
                {copy.terms.rows.map((row) => (
                  <div key={row.label} className="flex gap-4 py-3 text-[14px] leading-[22px]">
                    <dt className="w-[64px] shrink-0 font-semibold text-[#191919]">{row.label}</dt>
                    <dd className="text-[#333] break-keep">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[13px] leading-[20px] text-[#5f6368] break-keep">{copy.terms.note}</p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-[20px] leading-[30px] font-extrabold tracking-[-0.5px] text-[#191919] min-[992px]:text-[24px] min-[992px]:leading-[36px]">{copy.fit.title}</h2>
              <p className="rounded-[10px] bg-white p-5 text-[15px] leading-[24px] text-[#2b2421] break-keep">{copy.fit.good}</p>
              <div className="flex flex-col items-start gap-3 rounded-[10px] border border-[#eaded4] p-5">
                <p className="text-[14px] leading-[22px] text-[#5f6368] break-keep">{copy.fit.notYet}</p>
                {offers.freeTemplate.href && (
                  <ExternalButton href={offers.freeTemplate.href} tone="dark" className="rounded-[5px] px-4 py-2.5 text-[14px]">
                    {copy.fit.notYetCta}
                  </ExternalButton>
                )}
              </div>
            </div>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex max-w-[760px] flex-col gap-6">
            <SectionTitle title={copy.faq.title} />
            <div className="flex flex-col gap-2.5">
              {copy.faq.items.map((item) => (
                <details key={item.q} className="group rounded-[8px] bg-white px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] leading-[22px] font-semibold text-[#191919] break-keep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd715b]">
                    {item.q}
                    <ChevronDown aria-hidden className="size-4 shrink-0 text-[#c9412f] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-[14px] leading-[22px] text-[#5f6368] break-keep">{item.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#2b2421]`}>
          <Container className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[22px] leading-[32px] font-bold text-white break-keep min-[992px]:text-[28px] min-[992px]:leading-[40px]">{copy.closing.title}</h2>
            <p className="text-[20px] font-extrabold text-white">{offers.diagnosis.price}</p>
            <ExternalButton href={links.diagnosis} className="rounded-[5px] px-6 py-3 text-[16px]">
              {copy.closing.cta}
            </ExternalButton>
            <a
              href={links.kakaoChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-white/75 underline underline-offset-4 hover:text-white"
            >
              {copy.closing.kakao}
              <span className="sr-only">(새 탭에서 열림)</span>
            </a>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
