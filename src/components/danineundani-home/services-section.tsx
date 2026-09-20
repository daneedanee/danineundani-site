import { Check } from "lucide-react";
import Image from "next/image";

import { services } from "@/lib/site-content";

import { Container, ExternalButton, SectionTitle } from "./shared";

const images = [
  { src: "/images/danineundani/real/latpeed-product.png", width: 1024, height: 1024, fit: "object-cover", alt: "블로그 진단 방향 제안 상품 이미지" },
  { src: "/images/danineundani/real/converted/challenge-wide.png", width: 1280, height: 720, fit: "object-cover", alt: "매출로 이어지는 블로그 챌린지 커버" },
  { src: "/images/danineundani/service-agency.webp", width: 640, height: 354, fit: "object-cover", alt: "복리형 콘텐츠 블로그 관리 대행 영상" },
];

// 구역 4: 서비스 카드 (이미지 + 신청 버튼 + 배지 + 포함 내용 + 구성·가격 박스)
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
                  {service.includes.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {service.includes.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-[13px] leading-[19px] text-[#333] break-keep">
                          <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-[#c9412f]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {service.note && <p className="mt-3 text-[12px] leading-[18px] text-[#5f6368] break-keep">{service.note}</p>}
                </div>
                <div className="mt-2.5 bg-[#f4ebe3] p-4">
                  {service.details.length > 0 && (
                    <p className="mb-1 text-[12px] leading-[19.2px] font-medium text-[#5f6368] break-keep">{service.details.join(" · ")}</p>
                  )}
                  <p className="text-[18px] leading-[26px] font-extrabold text-[#191919]">{service.price}</p>
                  {service.priceNote && <p className="mt-1 text-[12px] leading-[18px] font-semibold text-[#c9412f] break-keep">{service.priceNote}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
