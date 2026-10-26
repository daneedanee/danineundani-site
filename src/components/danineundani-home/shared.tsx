// 홈페이지 구역들이 함께 쓰는 폭·제목·외부 링크 버튼.
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import { splitSentences } from "@/lib/sentences";
import { cn } from "@/lib/utils";

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[940px]", className)}>{children}</div>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <h2 className="text-[20px] leading-[30px] font-extrabold tracking-[-0.5px] text-[#191919] break-keep min-[992px]:text-[24px] min-[992px]:leading-[36px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mb-6 text-[14px] leading-[19.6px] text-[#5f6368] break-keep">
          <Sentences text={subtitle} />
        </p>
      )}
    </div>
  );
}

type ExternalButtonProps = {
  href: string;
  children: React.ReactNode;
  tone?: "coral" | "dark" | "white";
  className?: string;
  // 측정에서 주소 대신 이 이름으로 센다(예: 워크북 버튼 "workbook_click"). src/lib/visibility/measurement.ts 의 허용 이름만 쓰인다.
  measure?: "workbook_click";
};

export function ExternalButton({ href, children, tone = "coral", className, measure }: ExternalButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-1 font-semibold tracking-[-0.5px] transition-transform duration-200 hover:scale-[1.01]",
    tone === "coral" && "bg-[#fd715b] text-black",
    tone === "dark" && "bg-[#191919] text-white",
    tone === "white" && "bg-white text-black",
    className,
  );
  // 홈의 구역으로 가는 주소(/#구역)는 일반 링크로 둔다. next/link 로 걸면 화면이 내려가지 않는다 (site-header.tsx 와 같은 이유).
  if (href.startsWith("/#")) {
    return (
      <a href={href} className={classes} data-visibility-event={measure}>
        {children}
      </a>
    );
  }
  // 사이트 안의 주소(/agency 등)는 같은 탭에서 연다. 바깥 사이트만 새 탭으로 연다.
  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        className={classes}
        data-visibility-event={measure}
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      data-visibility-event={measure}
    >
      {children}
      <ArrowUpRight aria-hidden className="size-4 shrink-0" />
      <span className="sr-only">(새 탭에서 열림)</span>
    </a>
  );
}

// 문구 안의 **굵게** 를 굵은 글씨로 바꾼다 (진단 상세페이지·소개 페이지, 2026-10-26).
// 문장마다 줄을 바꿔 보인다 (2026-10-26 대표 「문장이 바뀌는 곳에서는 반드시 줄바꿈」). 나누는 규칙은 src/lib/sentences.ts.
export function Sentences({ text }: { text: string }) {
  return (
    <>
      {splitSentences(text).map((문장, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {문장}
        </Fragment>
      ))}
    </>
  );
}

// **굵게** 표시를 살리면서 문장마다 줄을 바꾼다. 굵게가 문장을 넘어가도 이어서 굵게 보인다.
export function Emphasis({ text }: { text: string }) {
  let 굵게 = false;
  let 열쇠 = 0;
  return (
    <>
      {splitSentences(text).map((문장, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {문장.split("**").map((조각, 순서) => {
            if (순서 > 0) 굵게 = !굵게;
            const key = 열쇠++;
            return 굵게 ? (
              <strong key={key} className="font-bold text-[#191919]">
                {조각}
              </strong>
            ) : (
              <Fragment key={key}>{조각}</Fragment>
            );
          })}
        </Fragment>
      ))}
    </>
  );
}
