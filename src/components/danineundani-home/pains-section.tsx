import { CircleQuestionMark, MessageCircleOff, Wallet } from "lucide-react";

import { pains } from "@/lib/site-content";

import { Container, SectionTitle } from "./shared";

const icons = [Wallet, MessageCircleOff, CircleQuestionMark];

// 구역 3: 고민 카드 3개
export function PainsSection() {
  return (
    <section id="pains" className="bg-[#fff4ea] px-4 pt-14 pb-[88px] min-[992px]:px-0 min-[992px]:pt-[88px] min-[992px]:pb-[132px]">
      <Container className="flex flex-col gap-6">
        <SectionTitle title={pains.title} />
        <ul className="grid justify-center gap-x-4 gap-y-4 [grid-template-columns:minmax(0,340px)] min-[992px]:gap-y-8 min-[992px]:[grid-template-columns:repeat(3,302.664px)]">
          {pains.items.map((text, index) => {
            const Icon = icons[index];
            return (
              <li
                key={text}
                className="relative flex h-[200px] flex-col justify-between overflow-hidden rounded-[10px] border-[1.5px] border-[#3a2c27] bg-[#302521] px-3 pt-3.5 pb-5 shadow-[0_12px_22px_rgba(112,69,48,0.12)] transition-transform duration-200 hover:-translate-y-0.5 min-[992px]:h-[260px]"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-[6px] border-[1.5px] border-[#191919] bg-[#fd715b]">
                  <Icon aria-hidden className="size-5 text-black" />
                </span>
                <p className="relative z-[1] text-[19px] leading-[26.4px] font-bold text-white break-keep min-[992px]:text-[20px]">{text}</p>
                <div aria-hidden className="absolute inset-x-0 bottom-0 z-0 h-[120px] bg-[linear-gradient(rgba(255,255,255,0),rgba(0,0,0,0.6)_79%)]" />
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
