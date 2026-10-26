import Link from "next/link";

import { homeReviews } from "@/lib/site-content";

import { Container, SectionTitle } from "./shared";

// 고민 찾기 바로 아래: 진단 후기 세 장과 블로그 챌린지 1기 후기 세 장, 묶음마다 더 보기 링크 (2026-10-26)
export function HomeReviews() {
  return (
    <section className="bg-[#fbf7f2] px-5 pt-14 pb-[88px] min-[992px]:px-0 min-[992px]:pt-[88px] min-[992px]:pb-[112px]">
      <Container className="flex flex-col gap-2">
        <SectionTitle title={homeReviews.title} subtitle={homeReviews.note} />
        <div className="flex flex-col gap-10">
          {homeReviews.groups.map((group) => (
            <div key={group.name} className="flex flex-col gap-3">
              <p className="self-start rounded-full bg-[#2b2421] px-3 py-1 text-[12px] leading-[18px] font-semibold text-[#fffdf9]">{group.name}</p>
              <ul className="grid gap-3 min-[992px]:grid-cols-3 min-[992px]:gap-4">
                {group.items.map((review) => (
                  <li key={review.text} className="flex flex-col justify-between gap-3 rounded-[10px] bg-[#fffdf9] p-5 shadow-[0_8px_20px_rgba(112,69,48,0.08)]">
                    <blockquote className="text-[15px] leading-[24px] text-[#2b2421] break-keep">&ldquo;{review.text}&rdquo;</blockquote>
                    <p className="text-[12px] leading-[18px] text-[#8a8178] break-keep">{review.source}</p>
                  </li>
                ))}
              </ul>
              <Link
                href={group.moreHref}
                className="mt-1 self-center text-[14px] font-semibold text-[#2b2421] underline decoration-[#fd715b] decoration-2 underline-offset-4 hover:text-[#c9412f]"
              >
                {group.more}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
