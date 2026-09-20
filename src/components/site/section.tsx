import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  title: string;
  description?: string;
  tone?: "light" | "ivory";
  children: React.ReactNode;
};

export function Section({ id, title, description, tone = "light", children }: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("px-5 pt-12 pb-16 md:pt-16 md:pb-24", tone === "ivory" ? "bg-ivory" : "bg-paper")}
    >
      <div className="mx-auto max-w-[960px]">
        <div className="mb-8 text-center md:mb-10">
          <h2 id={headingId} className="text-[22px] leading-snug font-extrabold text-ink md:text-[28px]">
            {title}
          </h2>
          {description && <p className="mt-2 text-sm leading-relaxed text-muted-ink md:text-[15px]">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
