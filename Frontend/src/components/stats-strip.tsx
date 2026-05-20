import { tools, categories } from "@/lib/tools";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stats = [
  { value: `${tools.length}+`, label: "Utilities" },
  { value: String(categories.length), label: "Categories" },
  { value: "100%", label: "Client-side" },
  { value: "0ms", label: "Round-trips" },
];

interface StatsStripProps {
  variant?: "default" | "landing";
}

export function StatsStrip({ variant = "default" }: StatsStripProps) {
  const isLanding = variant === "landing";

  return (
    <section
      className={cn(
        "relative mx-auto w-full max-w-7xl px-4 shrink-0",
        isLanding ? "py-4 sm:py-5" : "py-20",
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="rounded-2xl glass-solid shadow-card text-center border-border"
          >
            <CardContent className={cn("p-0", isLanding ? "p-4 sm:p-5" : "p-6")}>
              <p
                className={cn(
                  "font-display font-semibold text-gradient",
                  isLanding ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl",
                )}
              >
                {s.value}
              </p>
              <p className="mt-1.5 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
