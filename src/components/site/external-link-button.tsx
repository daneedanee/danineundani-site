import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type ExternalLinkButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "coral" | "outline";
  size?: "md" | "lg";
  className?: string;
};

export function ExternalLinkButton({
  href,
  children,
  variant = "coral",
  size = "md",
  className,
}: ExternalLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral",
        variant === "coral" && "bg-coral text-ink",
        variant === "outline" && "bg-white text-ink",
        size === "md" && "h-11 px-5 text-[15px]",
        size === "lg" && "h-14 px-7 text-base md:text-lg",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden className="size-4" />
      <span className="sr-only">(새 탭에서 열림)</span>
    </a>
  );
}
