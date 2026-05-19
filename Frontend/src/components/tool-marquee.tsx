import { featuredTools } from "@/lib/tools";

const labels = featuredTools.map((t) => t.name);
const row = [...labels, ...labels];

export function ToolMarquee() {
  return (
    <section className="relative py-12 overflow-hidden" aria-hidden>
      <div className="absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      <div className="marquee-track flex gap-3 w-max">
        {row.map((name, i) => (
          <span
            key={i}
            className="shrink-0 inline-flex items-center px-4 h-9 rounded-full glass-solid text-sm font-medium border border-border text-muted-foreground"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
