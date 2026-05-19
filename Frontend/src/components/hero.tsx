import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const chips = [
  { label: "{ json }", className: "left-[6%] top-[22%]" },
  { label: "JWT.eyJ", className: "left-[4%] top-[48%]" },
  { label: "base64", className: "left-[10%] top-[74%]" },
  { label: "/regex/g", className: "right-[8%] top-[28%]" },
  { label: "POST /api", className: "right-[6%] top-[52%]" },
  { label: "uuid v7", className: "right-[10%] top-[72%]" },
];

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden fade-in">
      <div
        aria-hidden
        className="absolute inset-0 grid-bg pointer-events-none opacity-90"
      />
      <div
        aria-hidden
        className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none hero-mesh-purple opacity-80"
      />
      <div
        aria-hidden
        className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full blur-3xl pointer-events-none hero-mesh-pink opacity-70"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[520px] h-[320px] rounded-full blur-3xl pointer-events-none hero-mesh-teal opacity-60"
      />

      <div className="hidden lg:block absolute inset-0 pointer-events-none max-w-6xl mx-auto">
        {chips.map((c) => (
          <span
            key={c.label}
            className={`absolute px-3 py-1.5 rounded-lg chip-float text-xs font-mono ${c.className}`}
          >
            {c.label}
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <h1 className="font-display text-5xl sm:text-7xl font-semibold leading-[1.02] tracking-tight text-foreground">
          The developer&apos;s
          <br />
          <span className="text-gradient">utility</span> hub.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Format, decode, generate, and test — every tool you need to ship faster, in
          one beautifully fast place.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link
            to="/tools"
            className="group inline-flex items-center gap-2 h-11 px-5 rounded-xl btn-primary font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150"
          >
            Explore tools
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#categories"
            className="inline-flex items-center h-11 px-5 rounded-xl glass-solid text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
          >
            Browse categories
          </a>
        </div>
      </div>
    </section>
  );
}
