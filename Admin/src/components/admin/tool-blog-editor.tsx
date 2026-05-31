"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MediaImageField } from "@/components/admin/media-image-field";
import { ToolBlogSeoChecklist } from "@/components/admin/tool-blog-seo-checklist";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { charCountColor } from "@/lib/tool-blog-seo";
import { adminApi } from "@/lib/api";
import type { Tool, ToolBlog, ToolBlogInput } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background/50 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function SeoHint({ len, min, max }: { len: number; min: number; max: number }) {
  return (
    <p className={cn("text-[11px] mt-1 tabular-nums", charCountColor(len, min, max))}>
      {len} / {max} chars {len >= min && len <= max ? "· Good" : len < min ? "· Too short" : "· Too long"}
    </p>
  );
}

function toInput(blog: ToolBlog): ToolBlogInput {
  return {
    title: blog.title,
    excerpt: blog.excerpt,
    body: blog.body,
    status: blog.status,
    featuredImageId: blog.featuredImageId,
    featuredImageAlt: blog.featuredImageAlt,
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    focusKeyword: blog.focusKeyword,
    metaKeywords: blog.metaKeywords,
    canonicalUrl: blog.canonicalUrl,
    ogTitle: blog.ogTitle,
    ogDescription: blog.ogDescription,
    ogImageId: blog.ogImageId,
    ogImageAlt: blog.ogImageAlt,
    twitterTitle: blog.twitterTitle,
    twitterDescription: blog.twitterDescription,
    twitterCard: blog.twitterCard,
    authorName: blog.authorName,
    articleSection: blog.articleSection,
    schemaType: blog.schemaType,
    seoLocale: blog.seoLocale,
    readingTimeMinutes: blog.readingTimeMinutes,
    autoGenerateSchema: blog.autoGenerateSchema,
    robots: blog.robots,
    noindex: blog.noindex,
    nofollow: blog.nofollow,
    schemaJson: blog.schemaJson,
  };
}

export function ToolBlogEditor({ token, tool }: { token: string; tool: Tool }) {
  const siteUrl = useAppSelector((s) => s.settings.site.publicSiteUrl);
  const [blog, setBlog] = useState<ToolBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metaKeywordsText, setMetaKeywordsText] = useState("");
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [ogPreview, setOgPreview] = useState<string | null>(null);

  const permalink = useMemo(() => {
    const base = (siteUrl || "http://localhost:3000").replace(/\/$/, "");
    return `${base}/tools/${tool.slug}#tool-blog`;
  }, [siteUrl, tool.slug]);

  useEffect(() => {
    adminApi
      .getToolBlog(token, tool.slug)
      .then((data) => {
        setBlog({
          ...data,
          articleSection: data.articleSection || tool.category,
          schemaType: data.schemaType || "BlogPosting",
          twitterCard: data.twitterCard || "summary_large_image",
          seoLocale: data.seoLocale || "en",
          autoGenerateSchema: data.autoGenerateSchema ?? true,
        });
        setMetaKeywordsText((data.metaKeywords ?? []).join(", "));
        setFeaturedPreview(data.featuredImageUrl);
        setOgPreview(data.ogImageUrl);
      })
      .catch(() => toast.error("Could not load blog"))
      .finally(() => setLoading(false));
  }, [token, tool.slug, tool.category]);

  if (loading || !blog) {
    return <p className="text-muted-foreground">Loading blog editor…</p>;
  }

  const patch = (partial: Partial<ToolBlog>) => {
    setBlog((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const fillSeoFromPost = () => {
    patch({
      metaTitle: blog.title.slice(0, 60),
      metaDescription: (blog.excerpt || blog.title).slice(0, 160),
      ogTitle: blog.title.slice(0, 60),
      ogDescription: (blog.excerpt || "").slice(0, 200),
      twitterTitle: blog.title.slice(0, 60),
      twitterDescription: (blog.excerpt || "").slice(0, 200),
      articleSection: tool.category,
      canonicalUrl: permalink,
      featuredImageAlt:
        blog.featuredImageAlt ||
        `${blog.focusKeyword || tool.name} - guide and tutorial`,
    });
    toast.success("SEO fields filled from post");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: ToolBlogInput = {
      ...toInput(blog),
      metaKeywords: metaKeywordsText
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    };
    try {
      const saved = await adminApi.upsertToolBlog(token, tool.slug, payload);
      setBlog(saved);
      setFeaturedPreview(saved.featuredImageUrl);
      setOgPreview(saved.ogImageUrl);
      toast.success("Blog saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const metaTitleLen = (blog.metaTitle || blog.title).length;
  const metaDescLen = (blog.metaDescription || blog.excerpt).length;

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-muted-foreground">Blog post for tool: </span>
          <span className="font-medium text-foreground">{tool.name}</span>
          <span className="text-muted-foreground"> ({tool.slug})</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={fillSeoFromPost}>
          Auto-fill SEO from post
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <WpPostbox title="Post content">
            <div className="space-y-3">
              <div>
                <Label htmlFor="blog-title">Post title (H1)</Label>
                <Input
                  id="blog-title"
                  value={blog.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="blog-excerpt">Excerpt (snippet summary)</Label>
                <Textarea
                  id="blog-excerpt"
                  value={blog.excerpt}
                  onChange={(e) => patch({ excerpt: e.target.value })}
                  rows={3}
                />
                <SeoHint len={blog.excerpt.length} min={80} max={200} />
              </div>
              <div>
                <Label htmlFor="blog-body">Full post (HTML: h2, p, ul, img alt, internal links)</Label>
                <Textarea
                  id="blog-body"
                  value={blog.body}
                  onChange={(e) => patch({ body: e.target.value })}
                  rows={18}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </WpPostbox>

          <WpPostbox title="On-page SEO (Google ranking)">
            <div className="space-y-3">
              <div>
                <Label htmlFor="meta-title">SEO title (search result title)</Label>
                <Input
                  id="meta-title"
                  value={blog.metaTitle ?? ""}
                  onChange={(e) => patch({ metaTitle: e.target.value || null })}
                  placeholder={blog.title}
                />
                <SeoHint len={metaTitleLen} min={50} max={60} />
              </div>
              <div>
                <Label htmlFor="meta-desc">Meta description (CTR in Google)</Label>
                <Textarea
                  id="meta-desc"
                  value={blog.metaDescription ?? ""}
                  onChange={(e) => patch({ metaDescription: e.target.value || null })}
                  rows={3}
                  placeholder={blog.excerpt}
                />
                <SeoHint len={metaDescLen} min={120} max={160} />
              </div>
              <div>
                <Label htmlFor="focus-kw">Focus keyword (primary rank target)</Label>
                <Input
                  id="focus-kw"
                  value={blog.focusKeyword ?? ""}
                  onChange={(e) => patch({ focusKeyword: e.target.value || null })}
                />
              </div>
              <div>
                <Label htmlFor="meta-kw">Secondary / LSI keywords (comma separated)</Label>
                <Input
                  id="meta-kw"
                  value={metaKeywordsText}
                  onChange={(e) => setMetaKeywordsText(e.target.value)}
                  placeholder="temp mail, disposable email, otp inbox"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="author">Author (E-E-A-T)</Label>
                  <Input
                    id="author"
                    value={blog.authorName ?? ""}
                    onChange={(e) => patch({ authorName: e.target.value || null })}
                    placeholder="Dev Hube Team"
                  />
                </div>
                <div>
                  <Label htmlFor="section">Article section / category</Label>
                  <Input
                    id="section"
                    value={blog.articleSection ?? ""}
                    onChange={(e) => patch({ articleSection: e.target.value || null })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="canonical">Canonical URL (duplicate content fix)</Label>
                <Input
                  id="canonical"
                  value={blog.canonicalUrl ?? ""}
                  onChange={(e) => patch({ canonicalUrl: e.target.value || null })}
                  placeholder={permalink}
                />
              </div>
            </div>
          </WpPostbox>

          <WpPostbox title="Social & sharing (off-page signals)">
            <div className="space-y-3">
              <div>
                <Label htmlFor="og-title">Open Graph title (Facebook, LinkedIn)</Label>
                <Input
                  id="og-title"
                  value={blog.ogTitle ?? ""}
                  onChange={(e) => patch({ ogTitle: e.target.value || null })}
                />
              </div>
              <div>
                <Label htmlFor="og-desc">Open Graph description</Label>
                <Textarea
                  id="og-desc"
                  value={blog.ogDescription ?? ""}
                  onChange={(e) => patch({ ogDescription: e.target.value || null })}
                  rows={2}
                />
              </div>
              <MediaImageField
                token={token}
                label="Social share image (1200×630 recommended)"
                value={blog.ogImageId}
                previewUrl={ogPreview}
                onChange={(id, url) => {
                  patch({ ogImageId: id });
                  setOgPreview(url);
                }}
              />
              <div>
                <Label htmlFor="og-alt">Social image alt text</Label>
                <Input
                  id="og-alt"
                  value={blog.ogImageAlt ?? ""}
                  onChange={(e) => patch({ ogImageAlt: e.target.value || null })}
                />
              </div>
              <div>
                <Label htmlFor="tw-title">Twitter / X title</Label>
                <Input
                  id="tw-title"
                  value={blog.twitterTitle ?? ""}
                  onChange={(e) => patch({ twitterTitle: e.target.value || null })}
                />
              </div>
              <div>
                <Label htmlFor="tw-desc">Twitter / X description</Label>
                <Textarea
                  id="tw-desc"
                  value={blog.twitterDescription ?? ""}
                  onChange={(e) => patch({ twitterDescription: e.target.value || null })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="tw-card">Twitter card type</Label>
                <select
                  id="tw-card"
                  className={selectClass}
                  value={blog.twitterCard}
                  onChange={(e) => patch({ twitterCard: e.target.value })}
                >
                  <option value="summary_large_image">Large image card</option>
                  <option value="summary">Summary card</option>
                </select>
              </div>
            </div>
          </WpPostbox>

          <WpPostbox title="Technical SEO & schema">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="schema-type">Schema type (rich results)</Label>
                  <select
                    id="schema-type"
                    className={selectClass}
                    value={blog.schemaType}
                    onChange={(e) => patch({ schemaType: e.target.value })}
                  >
                    <option value="BlogPosting">BlogPosting</option>
                    <option value="Article">Article</option>
                    <option value="TechArticle">TechArticle</option>
                    <option value="HowTo">HowTo</option>
                    <option value="FAQPage">FAQPage</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="locale">Content language</Label>
                  <Input
                    id="locale"
                    value={blog.seoLocale}
                    onChange={(e) => patch({ seoLocale: e.target.value })}
                    placeholder="en"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={blog.autoGenerateSchema}
                  onChange={(e) => patch({ autoGenerateSchema: e.target.checked })}
                />
                Auto-generate JSON-LD from SEO fields on save
              </label>
              {!blog.autoGenerateSchema ? (
                <div>
                  <Label htmlFor="schema">Custom JSON-LD schema</Label>
                  <Textarea
                    id="schema"
                    value={blog.schemaJson ?? ""}
                    onChange={(e) => patch({ schemaJson: e.target.value || null })}
                    rows={8}
                    className="font-mono text-xs"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Schema updates automatically when you save (Article, author, dates, keywords).
                </p>
              )}
              <div>
                <Label htmlFor="robots">Robots meta</Label>
                <Input
                  id="robots"
                  value={blog.robots}
                  onChange={(e) => patch({ robots: e.target.value })}
                  placeholder="index,follow"
                />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={blog.noindex}
                    onChange={(e) => patch({ noindex: e.target.checked })}
                  />
                  Noindex (hide from Google)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={blog.nofollow}
                    onChange={(e) => patch({ nofollow: e.target.checked })}
                  />
                  Nofollow links
                </label>
              </div>
            </div>
          </WpPostbox>
        </div>

        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <WpPostbox title="SEO checklist">
            <ToolBlogSeoChecklist blog={blog} siteUrl={siteUrl || "http://localhost:3000"} />
          </WpPostbox>

          <WpPostbox title="Publish">
            <div className="space-y-3">
              <div>
                <Label htmlFor="blog-status">Status</Label>
                <select
                  id="blog-status"
                  className={selectClass}
                  value={blog.status}
                  onChange={(e) =>
                    patch({ status: e.target.value as "draft" | "published" })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              {blog.readingTimeMinutes ? (
                <p className="text-xs text-muted-foreground">
                  Est. reading time: {blog.readingTimeMinutes} min
                </p>
              ) : null}
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : "Save blog post"}
              </Button>
            </div>
          </WpPostbox>

          <WpPostbox title="Permalink">
            <p className="text-xs text-muted-foreground break-all font-mono">{permalink}</p>
          </WpPostbox>

          <WpPostbox title="Featured image">
            <MediaImageField
              token={token}
              label="Hero image on tool page"
              value={blog.featuredImageId}
              previewUrl={featuredPreview}
              onChange={(id, url) => {
                patch({ featuredImageId: id });
                setFeaturedPreview(url);
              }}
            />
            <div className="mt-3">
              <Label htmlFor="feat-alt">Image alt text (image SEO)</Label>
              <Input
                id="feat-alt"
                value={blog.featuredImageAlt ?? ""}
                onChange={(e) => patch({ featuredImageAlt: e.target.value || null })}
                placeholder={`${tool.name} guide featured image`}
              />
            </div>
          </WpPostbox>
        </div>
      </div>
    </form>
  );
}
