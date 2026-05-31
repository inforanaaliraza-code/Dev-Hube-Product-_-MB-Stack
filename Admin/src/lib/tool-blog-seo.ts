import type { ToolBlog } from "@/lib/types";

export type SeoCheck = {
  id: string;
  label: string;
  ok: boolean;
  hint?: string;
};

export function charCountColor(len: number, min: number, max: number) {
  if (len === 0) return "text-muted-foreground";
  if (len >= min && len <= max) return "text-emerald-400";
  if (len < min) return "text-amber-400";
  return "text-orange-400";
}

export function evaluateToolBlogSeo(
  blog: ToolBlog,
  siteUrl: string,
): { score: number; checks: SeoCheck[] } {
  const kw = (blog.focusKeyword ?? "").trim().toLowerCase();
  const title = (blog.metaTitle || blog.title).toLowerCase();
  const desc = (blog.metaDescription || blog.excerpt).toLowerCase();
  const body = blog.body.toLowerCase();
  const metaLen = (blog.metaDescription || blog.excerpt).length;
  const titleLen = (blog.metaTitle || blog.title).length;

  const checks: SeoCheck[] = [
    {
      id: "title-len",
      label: "SEO title length (50–60 ideal)",
      ok: titleLen >= 30 && titleLen <= 65,
      hint: `${titleLen} characters`,
    },
    {
      id: "desc-len",
      label: "Meta description (120–160 ideal)",
      ok: metaLen >= 120 && metaLen <= 165,
      hint: `${metaLen} characters`,
    },
    {
      id: "focus",
      label: "Focus keyword set",
      ok: kw.length > 2,
    },
    {
      id: "focus-title",
      label: "Focus keyword in SEO title",
      ok: !kw || title.includes(kw),
    },
    {
      id: "focus-desc",
      label: "Focus keyword in meta description",
      ok: !kw || desc.includes(kw),
    },
    {
      id: "focus-body",
      label: "Focus keyword in article body",
      ok: !kw || body.includes(kw),
    },
    {
      id: "h2",
      label: "Article uses H2 headings",
      ok: /<h2[\s>]/i.test(blog.body),
    },
    {
      id: "img-alt",
      label: "Featured image alt text",
      ok: Boolean(blog.featuredImageId && blog.featuredImageAlt?.trim()),
      hint: blog.featuredImageId ? undefined : "No featured image",
    },
    {
      id: "canonical",
      label: "Canonical URL set",
      ok: Boolean(blog.canonicalUrl?.trim()),
      hint: `Default: ${siteUrl}/tools/${blog.toolSlug}#tool-blog`,
    },
    {
      id: "og",
      label: "Open Graph title & description",
      ok: Boolean((blog.ogTitle || blog.metaTitle) && (blog.ogDescription || blog.metaDescription)),
    },
    {
      id: "schema",
      label: "Structured data (JSON-LD)",
      ok: Boolean(blog.schemaJson?.trim()) || blog.autoGenerateSchema,
    },
    {
      id: "excerpt",
      label: "Excerpt / summary for snippets",
      ok: (blog.excerpt?.trim().length ?? 0) >= 80,
    },
    {
      id: "keywords",
      label: "Secondary keywords (LSI)",
      ok: (blog.metaKeywords?.length ?? 0) >= 2,
    },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}
