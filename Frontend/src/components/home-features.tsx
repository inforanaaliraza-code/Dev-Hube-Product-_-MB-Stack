"use client";

import { Zap, Lock, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "Instant, in-browser",
    body: "Every tool runs client-side where possible. No round-trips, no waiting.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Your data never leaves your device for local utilities. Period.",
  },
  {
    icon: Layers,
    title: "One consistent UI",
    body: "Stop juggling 12 sketchy sites. Everything lives under one roof.",
  },
];

export function HomeFeatures() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className={cn(glassCard, "p-6")}>
              <CardContent className="p-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-aurora-1 to-aurora-2 grid place-items-center mb-4">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
