import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ImageCompressorTool } from "@/components/tools/image-compressor/image-compressor-tool";
import { PdfToWordTool } from "@/components/tools/pdf-to-word/pdf-to-word-tool";
import { QrGeneratorTool } from "@/components/tools/qr-generator/qr-generator-tool";
import { TempMailTool } from "@/components/tools/temp-mail/temp-mail-tool";
import { ToolIcon } from "@/components/tool-icon";
import { PageGlow } from "@/components/page-glow";
import { Button } from "@/components/ui/button";
import { accentClass, getToolBySlug } from "@/lib/tools";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return { title: "Tool not found" };
  }
  return {
    title: tool.name,
    description: tool.description,
    keywords: tool.keywords,
  };
}

export function generateStaticParams() {
  return [
    { slug: "temp-mail" },
    { slug: "qr-generator" },
    { slug: "image-compressor" },
    { slug: "pdf-to-word" },
  ];
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    notFound();
  }

  if (tool.status !== "ready") {
    return (
      <div className="relative pt-32 pb-24 mx-auto max-w-3xl px-4 text-center">
        <PageGlow />
        <h1 className="font-display text-3xl font-semibold">{tool.name}</h1>
        <p className="mt-4 text-muted-foreground">{tool.tagline}</p>
        <p className="mt-2 text-sm text-muted-foreground">This tool is coming soon.</p>
        <Button variant="outline" className="mt-8" asChild>
          <Link href="/tools">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to tools
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative pt-28 pb-24 mx-auto max-w-6xl px-4">
      <PageGlow />
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-14 w-14 rounded-2xl bg-gradient-to-br grid place-items-center shrink-0",
              accentClass[tool.accent],
            )}
          >
            <ToolIcon name={tool.icon} className="text-primary-foreground h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
              {tool.category}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              {tool.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{tool.tagline}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild className="shrink-0 self-start sm:self-auto">
          <Link href="/tools">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All tools
          </Link>
        </Button>
      </div>
      {slug === "temp-mail" ? (
        <TempMailTool />
      ) : slug === "qr-generator" ? (
        <QrGeneratorTool />
      ) : slug === "image-compressor" ? (
        <ImageCompressorTool />
      ) : slug === "pdf-to-word" ? (
        <PdfToWordTool />
      ) : (
        <p className="text-muted-foreground text-center py-16">Tool UI is not available yet.</p>
      )}
    </div>
  );
}
