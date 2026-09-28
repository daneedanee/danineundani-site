// 편집기 안에서 되풀이해 쓰는 작은 부품들.
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ tone = "ghost", size = "md", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-[8px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-coral/60 disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-10 px-4 text-[14px]",
        tone === "primary" && "bg-coral text-black hover:bg-[#ff8a77]",
        tone === "ghost" && "border border-white/15 bg-white/5 text-white hover:bg-white/10",
        tone === "danger" && "border border-white/10 text-white/60 hover:border-[#c9412f] hover:text-[#ff8a77]",
        className,
      )}
      {...props}
    />
  );
}

export function Section({ title, hint, children, action }: { title: string; hint?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="border-b border-white/10 px-4 py-4 last:border-b-0">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[14px] font-bold text-white">{title}</h3>
          {hint && <p className="mt-0.5 text-[12px] leading-5 text-white/50">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export const inputClass =
  "w-full rounded-[8px] border border-white/15 bg-black/40 px-3 py-2 text-[14px] text-white placeholder:text-white/30 outline-none focus-visible:border-coral focus-visible:ring-2 focus-visible:ring-coral/30";

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  return (
    <label className="block text-[13px] text-white/70">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-white/50">{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-coral"
      />
    </label>
  );
}
