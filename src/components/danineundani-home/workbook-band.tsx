import { offerStatusLabels, offers, workbookBand } from "@/lib/site-content";

import { Container, ExternalButton } from "./shared";

// 상담 신청 바로 위: 무료 워크북으로 다니레터 구독을 받는 띠. 주소가 비면 띠를 숨긴다.
export function WorkbookBand() {
  const workbook = offers.freeTemplate;
  if (!workbook.href) return null;
  return (
    <section aria-labelledby="workbook-heading" className="bg-[#fff4ea] px-5 py-12 min-[992px]:px-0 min-[992px]:py-16">
      <Container className="flex flex-col items-start gap-4 rounded-[12px] bg-[#2b2421] p-6 text-white min-[992px]:flex-row min-[992px]:items-center min-[992px]:justify-between min-[992px]:gap-8 min-[992px]:p-10">
        <div className="flex flex-col gap-2">
          <span className="self-start rounded-[4px] bg-[#ffe5e1] px-2 py-1 text-[11px] leading-[15px] font-semibold text-[#c9412f]">{offerStatusLabels[workbook.status]}</span>
          <h2 id="workbook-heading" className="text-[20px] leading-[30px] font-bold tracking-[-0.5px] break-keep min-[992px]:text-[24px] min-[992px]:leading-[34px]">
            {workbookBand.title}
          </h2>
          <p className="text-[14px] leading-[22px] text-white/80 break-keep min-[992px]:text-[15px]">{workbookBand.description}</p>
        </div>
        <ExternalButton href={workbook.href} measure="workbook_click" className="shrink-0 rounded-[5px] px-5 py-3 text-[15px]">
          {workbook.cta}
        </ExternalButton>
      </Container>
    </section>
  );
}
