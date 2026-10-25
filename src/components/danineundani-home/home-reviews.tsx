import Link from "next/link";

import { homeReviews } from "@/lib/site-content";

import { Container, SectionTitle } from "./shared";

// 고민 찾기 바로 아래: 진단 후기 세 개와 진단 상세페이지 후기로 가는 링크 (2026-10-26)
export function HomeReviews() {
  return (
    <section className="bg-[#fbf7f2] px-5 pt-14 pb-[88px] min-[992px]:px-0 min-[992px]:pt-[88px] min-[992px]:pb-[112px]">
      <Container className="flex flex-col gap-2">
        <SectionTitle title={homeReviews.title} subtitle={homeReviews.note} />
        <ul className="grid gap-3 min-[992px]:grid-cols-3 min-[992px]:gap-4">
          {homeReviews.items.map((review) => (
            <li key={review.text} className="flex flex-col justify-between gap-3 rounded-[10px] bg-[#fffdf9] p-5 shadow-[0_8px_20px_rgba(112,69,48,0.08)]">
              <blockquote className="text-[15px] leading-[24px] text-[#2b2421] break-keep">&ldquo;{review.text}&rdquo;</blockquote>
              <p className="text-[12px] leading-[18px] text-[#8a8178] break-keep">{review.source}</p>
            </li>
          ))}
        </ul>
        <Link
          href={homeReviews.moreHref}
          className="mt-4 self-center text-[14px] font-semibold text-[#2b2421] underline decoration-[#fd715b] decoration-2 underline-offset-4 hover:text-[#c9412f]"
        >
          {homeReviews.more}
        </Link>
      </Container>
    </section>
  );
}
