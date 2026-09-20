import { CircleQuestionMark, MessageCircleOff, Wallet } from "lucide-react";

import { Section } from "@/components/site/section";
import { pains } from "@/lib/site-content";

const icons = [Wallet, MessageCircleOff, CircleQuestionMark];

export function Pains() {
  return (
    <Section id="pains" title={pains.title}>
      <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
        {pains.items.map((text, index) => {
          const Icon = icons[index];
          return (
            <li key={text} className="flex items-start gap-4 rounded-2xl border-2 border-ink bg-white p-5 md:flex-col md:p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-coral">
                <Icon aria-hidden className="size-5 text-ink" />
              </span>
              <p className="text-base leading-relaxed font-bold text-ink break-keep">{text}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
