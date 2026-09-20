import Image from "next/image";

import { links, services, steps } from "@/lib/site-content";

import { Container } from "./shared";

const markers = ["①", "②", "③"];
const targets = [links.diagnosis, links.challengePreRegister, links.kakaoChannel];

// 구역 5: 시작하는 순서 (각 줄이 신청 링크)
export function StepsSection() {
  return (
    <section
      id="steps"
      className="bg-[radial-gradient(circle_closest-side,rgba(253,113,91,0.2),rgba(253,113,91,0.03))] pt-14 pb-[88px] min-[992px]:py-28"
    >
      <Container>
        <div className="flex flex-col gap-6 px-5 min-[992px]:flex-row min-[992px]:items-center min-[992px]:justify-around min-[992px]:gap-8 min-[992px]:px-0">
          <div className="flex items-center gap-4 min-[992px]:flex-col min-[992px]:items-start">
            <Image
                src="/images/danineundani/real/channel-avatar.jpg"
                alt="다니는다니 유튜브 채널 프로필"
                width={120}
                height={120}
              className="size-20 shrink-0 rounded-full border-[1.5px] border-[#191919] object-cover min-[992px]:size-[140px]"
            />
            <h2 className="text-[22px] leading-[30px] font-bold tracking-[-0.5px] text-[#191919] break-keep min-[992px]:max-w-[300px] min-[992px]:text-[28px] min-[992px]:leading-[36.96px]">
              어디서부터 <span className="bg-[#fd715b]/30">시작하면</span> 좋을까요?
            </h2>
          </div>
          <ol className="flex flex-col gap-3 min-[992px]:w-[480px]">
            {steps.items.map((step, index) => (
              <li key={step.target}>
                <a
                  href={targets[index]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-[10px] bg-[#1c1c1c] py-2 pr-2 pl-4 text-white transition-transform duration-200 hover:-translate-y-0.5 min-[992px]:py-3 min-[992px]:pr-3 min-[992px]:pl-5"
                >
                  <span className="text-[14px] leading-[21px] font-light break-keep min-[992px]:text-[15px] min-[992px]:leading-[22.5px]">
                    <span aria-hidden className="mr-1.5 font-bold text-[#fd715b]">
                      {markers[index]}
                    </span>
                    {step.text}
                  </span>
                  <span className="w-[112px] shrink-0 rounded-[6px] bg-white px-2 py-2.5 text-center text-[13px] leading-[20px] font-semibold tracking-[-0.5px] text-black min-[992px]:w-[140px] min-[992px]:py-3.5 min-[992px]:text-[15px] min-[992px]:leading-[22px]">
                    {services.items[index].cta}
                  </span>
                  <span className="sr-only">(새 탭에서 열림)</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
