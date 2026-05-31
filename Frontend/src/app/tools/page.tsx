import type { Metadata } from "next";
import { Suspense } from "react";
import { tools } from "@/lib/tools";
import { ToolsView } from "./tools-view";

export const metadata: Metadata = {
  title: "All tools",
  description: `Browse ${tools.length}+ utilities: temp mail, QR codes, PDF tools, AI generators, SEO and developer tools.`,
  openGraph: {
    title: "All tools — Dev Hube",
    url: "/tools",
  },
  alternates: {
    canonical: "/tools",
  },
};

type PageProps = {
  searchParams: Promise<{ category?: string; nav?: string }>;
};

export default async function ToolsPage({ searchParams }: PageProps) {
  const { category, nav } = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="relative pt-32 pb-24 mx-auto max-w-7xl px-4 text-center text-muted-foreground">
          Loading tools…
        </div>
      }
    >
      <ToolsView initialCategory={category} initialNav={nav} />
    </Suspense>
  );
}
