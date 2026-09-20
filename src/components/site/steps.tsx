import { ArrowRight } from "lucide-react";

import { Section } from "@/components/site/section";
import { steps } from "@/lib/site-content";

const markers = ["①", "②", "③"];

export function Steps() {
  return (
    <Section id="steps" title={steps.title}>
      <ol className="grid gap-4 md:grid-cols-3 md:gap-5">
        {steps.items.map((step, index) => (
          <li key={step.target}>
            <a
              href={`#${step.target}`}
              className="group flex h-full items-center gap-4 rounded-2xl border-2 border-ink bg-white p-5 transition-transform hover:-translate-y-0.5"
            >
              <span aria-hidden className="text-3xl font-black text-coral-deep">
                {markers[index]}
              </span>
              <span className="flex-1 text-[15px] leading-relaxed font-bold text-ink break-keep">{step.text}</span>
              <ArrowRight aria-hidden className="size-5 shrink-0 text-ink transition-transform group-hover:translate-x-0.5" />
            </a>
          </li>
        ))}
      </ol>
    </Section>
  );
}
