const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export interface ToolBlogPublic {
  id: string | null;
  toolSlug: string;
  toolName: string;
  toolTagline: string;
  toolCategory: string;
  toolIcon: string;
  toolAccent: string;
  title: string;
  excerpt: string;
  body: string;
  status: string;
  featuredImageId: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  metaKeywords: string[];
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageId: string | null;
  ogImageUrl: string | null;
  ogImageAlt: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterCard: string;
  authorName: string | null;
  articleSection: string | null;
  schemaType: string;
  seoLocale: string;
  readingTimeMinutes: number | null;
  autoGenerateSchema: boolean;
  robots: string;
  noindex: boolean;
  nofollow: boolean;
  schemaJson: string | null;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export function resolveMediaUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = API_BASE.replace(/\/api\/v1\/?$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/api/v1/")) {
    return `${base}${normalized}`;
  }
  return `${base}/api/v1/uploads/${path.replace(/^\//, "")}`;
}

export async function fetchPublishedToolBlogs(): Promise<ToolBlogPublic[]> {
  try {
    const res = await fetch(`${API_BASE}/site/tool-blogs`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const rows = (await res.json()) as ToolBlogPublic[];
    return rows.map((row) => ({
      ...row,
      featuredImageUrl: resolveMediaUrl(row.featuredImageUrl),
      ogImageUrl: resolveMediaUrl(row.ogImageUrl),
    }));
  } catch {
    return [];
  }
}

export async function fetchToolBlogBySlug(toolSlug: string): Promise<ToolBlogPublic | null> {
  try {
    const res = await fetch(`${API_BASE}/site/tools/${encodeURIComponent(toolSlug)}/blog`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const row = (await res.json()) as ToolBlogPublic;
    return {
      ...row,
      featuredImageUrl: resolveMediaUrl(row.featuredImageUrl),
      ogImageUrl: resolveMediaUrl(row.ogImageUrl),
    };
  } catch {
    return null;
  }
}
