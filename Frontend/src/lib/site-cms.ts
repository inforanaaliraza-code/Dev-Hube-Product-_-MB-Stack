const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export interface CmsContentPublic {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  type: "page" | "post";
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchPublishedPosts(): Promise<CmsContentPublic[]> {
  try {
    const res = await fetch(`${API_BASE}/site/posts`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return (await res.json()) as CmsContentPublic[];
  } catch {
    return [];
  }
}

export async function fetchPublishedPost(slug: string): Promise<CmsContentPublic | null> {
  try {
    const res = await fetch(`${API_BASE}/site/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CmsContentPublic;
  } catch {
    return null;
  }
}

export async function fetchPublishedPage(slug: string): Promise<CmsContentPublic | null> {
  try {
    const res = await fetch(`${API_BASE}/site/pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CmsContentPublic;
  } catch {
    return null;
  }
}
