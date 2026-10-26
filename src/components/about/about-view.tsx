import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container, Emphasis, ExternalButton, SectionTitle } from "@/components/danineundani-home/shared";
import { SiteFooter } from "@/components/danineundani-home/site-footer";
import { SiteHeader } from "@/components/danineundani-home/site-header";
import { aboutPage as copy, homeReviews } from "@/lib/site-content";

const sectionClass = "px-5 py-14 min-[992px]:px-0 min-[992px]:py-[88px]";
const cardClass = "rounded-[10px] bg-[#fffdf9] shadow-[0_8px_20px_rgba(112,69,48,0.08)]";

// 소개 페이지(메뉴 "다니는다니는"). 순서: 한 줄 소개 → 다니 이야기 → 하고 싶은 일 → 일하는 방식 → 시작할 곳 → 함께한 대표님들 → 채널 → 마무리.
export function AboutView() {
  return (
    <div className="text-[14px] leading-5 text-[#333]">
      <SiteHeader />
      <main>
        <section aria-labelledby="about-heading" className="mt-20 bg-[#2b2421] bg-[radial-gradient(circle_at_80%_30%,rgba(253,113,91,0.3),transparent_45%)]">
          <div className="mx-auto flex max-w-[900px] flex-col items-center gap-8 px-5 py-16 text-center min-[992px]:flex-row min-[992px]:items-center min-[992px]:gap-12 min-[992px]:text-left">
            <Image
              src={copy.hero.photo.src}
              alt={copy.hero.photo.alt}
              width={copy.hero.photo.width}
              height={copy.hero.photo.height}
              priority
              className="size-[160px] shrink-0 rounded-full border-4 border-white/15 object-cover min-[992px]:size-[220px]"
            />
            <div className="flex flex-col items-center gap-4 min-[992px]:items-start">
              <p className="text-[12px] font-bold tracking-[0.2em] text-[#fd715b]">{copy.hero.eyebrow}</p>
              <h1 id="about-heading" className="text-[24px] leading-[35px] font-bold tracking-[-0.5px] text-white break-keep min-[992px]:text-[32px] min-[992px]:leading-[46px]">
                {copy.hero.titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="text-[14px] text-white/70">{copy.hero.name}</p>
            </div>
          </div>
        </section>

        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex max-w-[760px] flex-col gap-5">
            <SectionTitle title={copy.story.title} />
            <div className="flex flex-col gap-3 rounded-[10px] bg-white p-6 text-[15px] leading-[26px] text-[#2b2421] break-keep min-[992px]:p-8">
              {copy.story.paragraphs.map((paragraph) => (
                <p key={paragraph}>
                  <Emphasis text={paragraph} />
                </p>
              ))}
            </div>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fbf7f2]`}>
          <Container className="flex max-w-[760px] flex-col items-center gap-5 text-center">
            <SectionTitle title={copy.message.title} />
            <p className="text-[20px] leading-[32px] font-extrabold tracking-[-0.5px] text-[#c9412f] break-keep min-[992px]:text-[26px] min-[992px]:leading-[40px]">
              {copy.message.lead}
            </p>
            {copy.message.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-[620px] text-[15px] leading-[26px] text-[#2b2421] break-keep">
                {paragraph}
              </p>
            ))}
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex flex-col gap-6">
            <SectionTitle title={copy.principles.title} />
            <ul className="grid gap-3 min-[992px]:grid-cols-2 min-[992px]:gap-4">
              {copy.principles.items.map((item, index) => (
                <li key={item.title} className={`${cardClass} p-5`}>
                  <p className="text-[12px] leading-4 font-bold text-[#c9412f]">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 text-[17px] leading-[26px] font-bold text-[#191919] break-keep">{item.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[22px] text-[#5f6368] break-keep">{item.text}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fbf7f2]`}>
          <Container className="flex flex-col gap-6">
            <SectionTitle title={copy.paths.title} />
            <ul className="grid gap-3 min-[992px]:grid-cols-2 min-[992px]:gap-4">
              {copy.paths.items.map((item) => (
                <li key={item.name} className={`${cardClass} flex flex-col items-start gap-2 p-5`}>
                  <p className="text-[13px] leading-[20px] text-[#8a8178] break-keep">{item.who}</p>
                  <h3 className="text-[17px] leading-[26px] font-bold text-[#191919] break-keep">{item.name}</h3>
                  <ExternalButton href={item.href} tone="dark" measure={item.measure} className="mt-1 rounded-[5px] px-4 py-2.5 text-[14px]">
                    {item.cta}
                  </ExternalButton>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* 함께한 대표님들: 홈 후기(진단 세 장 + 챌린지 1기 세 장)와 같은 글 */}
        <section className={`${sectionClass} bg-[#fff4ea]`}>
          <Container className="flex flex-col gap-6">
            <SectionTitle title={copy.reviewsTitle} subtitle={homeReviews.note} />
            <div className="grid gap-6 min-[992px]:grid-cols-2">
              {homeReviews.groups.map((group) => (
                <div key={group.name} className="flex flex-col gap-3">
                  <h3 className="text-[16px] leading-[24px] font-bold text-[#191919]">{group.name}</h3>
                  <ul className="flex flex-col gap-3">
                    {group.items.map((review) => (
                      <li key={review.text} className={`${cardClass} flex flex-col gap-2 p-5`}>
                        <blockquote className="text-[15px] leading-[24px] text-[#2b2421] break-keep">&ldquo;{review.text}&rdquo;</blockquote>
                        <p className="text-[12px] leading-[18px] text-[#8a8178]">{review.source}</p>
                      </li>
                    ))}
                  </ul>
                  <Link href={group.moreHref} className="self-start text-[14px] font-semibold text-[#191919] underline decoration-[#fd715b] underline-offset-4">
                    {group.more}
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#fbf7f2]`}>
          <Container className="flex max-w-[760px] flex-col gap-6">
            <SectionTitle title={copy.channels.title} />
            <ul className="grid gap-2.5 min-[992px]:grid-cols-2">
              {copy.channels.items.map((channel) => {
                const external = !channel.href.startsWith("/");
                return (
                  <li key={channel.name}>
                    <a
                      href={channel.href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex items-center justify-between gap-3 rounded-[8px] bg-white px-4 py-3.5 text-[15px] leading-[22px] font-semibold text-[#2b2421] break-keep hover:text-[#c9412f]"
                    >
                      {channel.name}
                      <ArrowUpRight aria-hidden className="size-4 shrink-0 text-[#c9412f]" />
                      {external && <span className="sr-only">(새 탭에서 열림)</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>

        <section className={`${sectionClass} bg-[#2b2421]`}>
          <Container className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[22px] leading-[32px] font-bold text-white break-keep min-[992px]:text-[28px] min-[992px]:leading-[40px]">{copy.closing.title}</h2>
            <ExternalButton href={copy.closing.href} className="rounded-[5px] px-6 py-3 text-[16px]">
              {copy.closing.cta}
            </ExternalButton>
            <a href={copy.closing.secondaryHref} className="text-[14px] text-white/75 underline underline-offset-4 hover:text-white">
              {copy.closing.secondary}
            </a>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
