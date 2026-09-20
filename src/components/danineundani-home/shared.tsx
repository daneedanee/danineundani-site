// 홈페이지 구역들이 함께 쓰는 폭·제목·외부 링크 버튼.
import { ArrowUpRight } from "lucide-react";

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
      {subtitle && <p className="mb-6 text-[14px] leading-[19.6px] text-[#5f6368] break-keep">{subtitle}</p>}
    </div>
  );
}

type ExternalButtonProps = {
  href: string;
  children: React.ReactNode;
  tone?: "coral" | "dark" | "white";
  className?: string;
};

export function ExternalButton({ href, children, tone = "coral", className }: ExternalButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-1 font-semibold tracking-[-0.5px] transition-transform duration-200 hover:scale-[1.01]",
        tone === "coral" && "bg-[#fd715b] text-black",
        tone === "dark" && "bg-[#191919] text-white",
        tone === "white" && "bg-white text-black",
        className,
      )}
    >
      {children}
      <ArrowUpRight aria-hidden className="size-4 shrink-0" />
      <span className="sr-only">(새 탭에서 열림)</span>
    </a>
  );
}
