import type { Metadata } from "next";

import Link from "next/link";

import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { ToolIcon } from "@/components/tool-icon";

import { PageGlow } from "@/components/page-glow";

import { Button } from "@/components/ui/button";

import { READY_TOOL_SLUGS, TOOL_COMPONENTS } from "@/app/tools/tool-registry";
import { ToolPageWorkflowShell } from "@/components/tools/shared/tool-page-shell";

import { ToolBlogSection } from "@/components/tool-blog-section";
import { fetchToolBlogBySlug } from "@/lib/tool-blog";
import { TOOL_ACCENT_ICON, TOOL_ACCENT_RING } from "@/lib/tool-visuals";
import { getToolBySlug } from "@/lib/tools";

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

  const blog = await fetchToolBlogBySlug(slug);

  const title = blog?.metaTitle || blog?.title || tool.name;

  const description = blog?.metaDescription || blog?.excerpt || tool.description;

  const keywords = blog?.metaKeywords?.length ? blog.metaKeywords : tool.keywords;

  const robots =
    blog?.noindex || blog?.nofollow
      ? {
          index: !blog?.noindex,
          follow: !blog?.nofollow,
        }
      : undefined;

  return {

    title,

    description,

    keywords,

    robots,

    alternates: blog?.canonicalUrl ? { canonical: blog.canonicalUrl } : undefined,

    openGraph: blog
      ? {
          type: "article",
          locale: blog.seoLocale || "en",
          title: blog.ogTitle || title,
          description: blog.ogDescription || description,
          images: blog.ogImageUrl
            ? [{ url: blog.ogImageUrl, alt: blog.ogImageAlt || blog.featuredImageAlt || title }]
            : undefined,
          publishedTime: blog.publishedAt ?? undefined,
          modifiedTime: blog.updatedAt ?? undefined,
          section: blog.articleSection || tool.category,
          authors: blog.authorName ? [blog.authorName] : undefined,
        }
      : undefined,

    twitter: blog
      ? {
          card:
            blog.twitterCard === "summary" ? "summary" : "summary_large_image",
          title: blog.twitterTitle || blog.ogTitle || title,
          description: blog.twitterDescription || blog.ogDescription || description,
          images: blog.ogImageUrl ? [blog.ogImageUrl] : undefined,
        }
      : undefined,

  };

}



export function generateStaticParams() {

  return READY_TOOL_SLUGS.map((slug) => ({ slug }));

}



export default async function ToolPage({ params }: Props) {

  const { slug } = await params;

  const tool = getToolBySlug(slug);

  if (!tool) {

    notFound();

  }

  const blog = await fetchToolBlogBySlug(slug);

  const ToolUi = TOOL_COMPONENTS[slug];



  if (tool.status !== "ready" || !ToolUi) {

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

        {blog ? (
          <div className="mt-12 max-w-4xl mx-auto text-left">
            <ToolBlogSection blog={blog} />
          </div>
        ) : null}

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
              "h-14 w-14 rounded-2xl border grid place-items-center shrink-0",
              TOOL_ACCENT_RING[tool.accent],
            )}
          >
            <ToolIcon name={tool.icon} className={cn("h-7 w-7", TOOL_ACCENT_ICON[tool.accent])} />
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

      <ToolPageWorkflowShell slug={slug}>
        <ToolUi />
      </ToolPageWorkflowShell>

      {blog ? (
        <div className="mt-4 px-0 sm:px-2">
          <ToolBlogSection blog={blog} />
        </div>
      ) : null}

    </div>

  );

}


