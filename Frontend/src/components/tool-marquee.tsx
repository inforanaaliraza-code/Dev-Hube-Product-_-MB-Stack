import { featuredTools } from "@/lib/tools";
import { Badge } from "@/components/ui/badge";

const labels = featuredTools.map((t) => t.name);
const row = [...labels, ...labels];

export function ToolMarquee() {
  return (
    <section className="relative shrink-0 pb-4 sm:pb-5 pt-2 overflow-hidden" aria-hidden>
      <div className="absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      <div className="marquee-track flex gap-3 w-max">
        {row.map((name, i) => (
          <Badge key={i} variant="chip" className="shrink-0 h-8 px-3 text-xs">
            {name}
          </Badge>
        ))}
      </div>
    </section>
  );
}
