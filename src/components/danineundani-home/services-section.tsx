import Image from "next/image";

import { services } from "@/lib/site-content";

import { Container, ExternalButton, SectionTitle } from "./shared";

const images = [
  { src: "/images/danineundani/real/latpeed-product.png", width: 1024, height: 1024, fit: "object-cover", alt: "블로그 진단 방향 제안 상품 이미지" },
  { src: "/images/danineundani/real/converted/challenge-wide.png", width: 1280, height: 720, fit: "object-cover", alt: "매출로 이어지는 블로그 챌린지 커버" },
  { src: "/images/danineundani/service-agency.webp", width: 640, height: 354, fit: "object-cover", alt: "복리형 콘텐츠 블로그 관리 대행 영상" },
];

// 서비스 한눈에 보기: 고민 찾기 없이 바로 고르려는 사람을 위한 짧은 카드 (2026-10-26 대표 결정으로 유튜브 띠 아래로, 포함 내용·구성은 상세페이지에서)
export function ServicesSection() {
  return (
    <section id="services" className="bg-[#fbf7f2] px-5 pt-14 pb-[88px] min-[992px]:px-0 min-[992px]:pt-[88px] min-[992px]:pb-[132px]">
      <Container className="flex flex-col gap-6">
        <SectionTitle title={services.title} />
        <ul className="grid justify-center gap-4 [grid-template-columns:minmax(0,340px)] min-[992px]:gap-5 min-[992px]:[grid-template-columns:repeat(3,302px)]">
          {services.items.map((service, index) => {
            const image = images[index];
            return (
              <li
                key={service.id}
                id={service.id}
                className="flex flex-col overflow-hidden rounded-[10px] bg-[#fffdf9] pt-4 shadow-[0_8px_20px_rgba(112,69,48,0.12)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="mx-4 aspect-[16/9] overflow-hidden rounded-[8px] bg-[#fff8f0]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    unoptimized={image.src.endsWith(".png") || image.src.endsWith("service-agency.webp")}
                    className={`h-full w-full ${image.fit}`}
                  />
                </div>
                <div className="mx-4 mt-4 flex items-center justify-end">
                  <ExternalButton href={service.href} tone="dark" className="w-[140px] rounded-[4px] py-2 text-[12px] leading-5 font-medium">
                    {service.cta}
                  </ExternalButton>
                </div>
                <div className="mx-4 mt-4 flex flex-1 flex-col items-start gap-1 pb-2.5">
                  <h3 className="text-[16px] leading-6 font-semibold text-[#333] break-keep">{service.name}</h3>
                  <p className="mb-1 text-[14px] leading-[21px] text-[#333] break-keep">{service.description}</p>
                  <span className="mt-1 -ml-0.5 rounded-[4px] bg-[#ffe5e1] px-2 py-1 text-[11px] leading-[15px] font-semibold text-[#c9412f]">
                    {service.badge}
                  </span>
                </div>
                {service.price && (
                  <div className="mt-2.5 bg-[#f4ebe3] px-4 py-3">
                    <p className="text-[18px] leading-[26px] font-extrabold text-[#191919]">{service.price}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
