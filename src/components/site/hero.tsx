import { CircleCheck, CirclePause, Megaphone, Users, Wallet } from "lucide-react";

import { ExternalLinkButton } from "@/components/site/external-link-button";
import { hero, links } from "@/lib/site-content";
import { cn } from "@/lib/utils";

type FlowStep = { icon: typeof Wallet; label: string };

function FlowRow({ steps, active }: { steps: FlowStep[]; active: boolean }) {
  return (
    <ol className="grid grid-cols-3 items-center gap-2 sm:gap-3">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <li key={step.label} className="relative">
            <div
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 bg-white px-2 py-4 text-center",
                active ? "border-ink" : "border-muted-ink/50",
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full border-2",
                  active ? "border-ink bg-coral text-ink" : "border-muted-ink/50 bg-paper text-muted-ink",
                )}
              >
                <Icon aria-hidden className="size-5" />
              </span>
              <span className={cn("text-[13px] font-bold sm:text-sm", active ? "text-ink" : "text-muted-ink")}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 -right-2 z-10 -translate-y-1/2 text-base font-black sm:-right-3",
                  active ? "text-ink" : "text-muted-ink/60",
                )}
              >
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function AdDependencyDiagram() {
  return (
    <figure className="rounded-3xl border-2 border-ink bg-paper p-4 sm:p-6">
      <div className="space-y-4">
        <FlowRow
          active
          steps={[
            { icon: Wallet, label: "광고비" },
            { icon: Megaphone, label: "광고" },
            { icon: CircleCheck, label: "유입 발생" },
          ]}
        />
        <FlowRow
          active={false}
          steps={[
            { icon: Wallet, label: "광고비 OFF" },
            { icon: Users, label: "유입 / 문의" },
            { icon: CirclePause, label: "유입 정지" },
          ]}
        />
      </div>
      <figcaption className="mt-4 text-center text-[13px] font-bold text-ink">광고비 OFF → 유입도 STOP</figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="bg-ivory px-5 pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="mx-auto grid max-w-[1080px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <div>
          <h1
            id="hero-heading"
            className="text-[30px] leading-[1.3] font-extrabold tracking-tight text-ink break-keep sm:text-4xl md:text-[44px]"
          >
            {hero.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink break-keep md:text-lg">{hero.description}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-ink break-keep">{hero.subDescription}</p>
          <ExternalLinkButton href={links.diagnosis} size="lg" className="mt-8">
            {hero.cta}
          </ExternalLinkButton>
        </div>
        <AdDependencyDiagram />
      </div>
    </section>
  );
}
