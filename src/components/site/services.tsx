import { ExternalLinkButton } from "@/components/site/external-link-button";
import { Section } from "@/components/site/section";
import { services } from "@/lib/site-content";

export function Services() {
  return (
    <Section id="services" title={services.title} tone="ivory">
      <ul className="grid gap-5 md:grid-cols-3">
        {services.items.map((service) => (
          <li
            key={service.id}
            id={service.id}
            className="flex scroll-mt-24 flex-col rounded-2xl border-2 border-ink bg-white p-6"
          >
            <span className="self-start rounded-full border-2 border-ink bg-coral px-3 py-0.5 text-xs font-bold text-ink">
              {service.badge}
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-ink break-keep">{service.name}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink break-keep">{service.description}</p>
            {service.details.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {service.details.map((detail) => (
                  <li key={detail} className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-muted-ink">
                    {detail}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto pt-6">
              <p className="border-t-2 border-dashed border-ink/20 pt-4 text-xl font-extrabold text-ink">{service.price}</p>
              <ExternalLinkButton href={service.href} className="mt-4 w-full">
                {service.cta}
              </ExternalLinkButton>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
