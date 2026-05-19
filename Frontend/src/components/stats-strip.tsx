import { tools, categories } from "@/lib/tools";

const stats = [
  { value: `${tools.length}+`, label: "Utilities" },
  { value: String(categories.length), label: "Categories" },
  { value: "100%", label: "Client-side" },
  { value: "0ms", label: "Round-trips" },
];

export function StatsStrip() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-6 rounded-2xl glass-solid shadow-card text-center border border-border"
          >
            <p className="font-display text-4xl sm:text-5xl font-semibold text-gradient">
              {s.value}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
