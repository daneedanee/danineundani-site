import { Container, SectionTitle } from "@/components/danineundani-home/shared";
import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";
import { letterPage as copy } from "@/lib/site-content";

import { StibeeForm } from "./stibee-form";

const sectionClass = "px-5 py-14 min-[992px]:px-0 min-[992px]:py-[88px]";
const cardClass = "rounded-[10px] bg-[#fffdf9] shadow-[0_8px_20px_rgba(112,69,48,0.08)]";

// 다니레터 설명 페이지 (2026-10-26). 설명은 홈페이지 톤으로, 구독 칸은 첫 화면 바로 아래에 스티비 공식 폼으로 둔다.
export function LetterView() {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      <main>
        <section aria-labelledby="letter-heading" className="mt-20 bg-[#2b2421] bg-[radial-gradient(circle_at_80%_30%,rgba(253,113,91,0.3),transparent_45%)]">
          <div className="mx-auto flex max-w-[900px] flex-col items-center px-5 pt-16 pb-28 text-center min-[992px]:pb-32">
            <p className="mb-5 text-[12px] font-bold tracking-[0.2em] text-[#fd715b]">{copy.hero.eyebrow}</p>
            <h1 id="letter-heading" className="text-[26px] leading-[36px] font-bold tracking-[-0.5px] text-white break-keep min-[992px]:text-[38px] min-[992px]:leading-[52px]">
              {copy.hero.title}
            </h1>
            <p className="mt-4 max-w-[620px] text-[15px] leading-[24px] font-light text-white/90 break-keep min-[992px]:text-[17px] min-[992px]:leading-[28px]">
              {copy.hero.description}
            </p>
          </div>
        </section>

        {/* 구독 칸: 첫 화면에 겹쳐 바로 보이게 */}
        <section id="letter-form" className="relative -mt-20 scroll-mt-28 bg-[linear-gradient(to_bottom,transparent_80px,#fbf7f2_80px)] px-5 pb-14 min-[992px]:px-0">
          <div className={`${cardClass} mx-auto max-w-[520px] p-6 min-[992px]:p-8`}>
            <h2 className="text-[18px] leading-[27px] font-bold text-[#191919] break-keep">{copy.hero.formTitle}</h2>
            <div className="mt-4">
              <StibeeForm />
            </div>
            <p className="mt-3 text-[12px] leading-[18px] text-[#8a8178] break-keep">* {copy.form.mailNote}</p>
          </div>
        </section>

        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex max-w-[860px] flex-col gap-6">
            <SectionTitle title={copy.benefits.title} />
            <ol className="grid gap-3 min-[992px]:grid-cols-3 min-[992px]:gap-4">
              {copy.benefits.items.map((item, index) => (
                <li key={item.title} className={`${cardClass} flex flex-col gap-2 p-5`}>
                  <span aria-hidden className="text-[22px] leading-[28px] font-extrabold text-[#fd715b]">
                    {index + 1}
                  </span>
                  <h3 className="text-[16px] leading-[24px] font-bold text-[#191919] break-keep">{item.title}</h3>
                  <p className="text-[14px] leading-[23px] text-[#5f6368] break-keep">{item.text}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#2b2421]`}>
          <Container className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[22px] leading-[32px] font-bold text-white break-keep min-[992px]:text-[28px] min-[992px]:leading-[40px]">{copy.closing.title}</h2>
            <a href="#letter-form" className="inline-flex items-center justify-center rounded-[5px] bg-[#fd715b] px-6 py-3 text-[16px] font-semibold tracking-[-0.5px] text-black transition-transform duration-200 hover:scale-[1.01]">
              {copy.closing.cta}
            </a>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
