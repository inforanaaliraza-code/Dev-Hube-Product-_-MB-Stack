export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  target: "_self" | "_blank";
  sortOrder: number;
  enabled: boolean;
}

export interface PublicSiteSettings {
  siteName: string;
  publicSiteUrl: string;
  maintenanceMode: boolean;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  gallery: {
    bend: number;
    scrollSpeed: number;
    scrollEase: number;
  };
  navigation: NavMenuItem[];
}

export const DEFAULT_PUBLIC_SITE: PublicSiteSettings = {
  siteName: "Dev Hube",
  publicSiteUrl: "http://localhost:3000",
  maintenanceMode: false,
  tagline: "The developer's utility hub",
  heroTitle: "Build faster with",
  heroSubtitle: "50+ utilities in one premium hub.",
  gallery: { bend: 1, scrollSpeed: 2, scrollEase: 0.05 },
  navigation: [
    { id: "home", label: "Home", href: "/", target: "_self", sortOrder: 0, enabled: true },
    { id: "tools", label: "Tools", href: "/tools", target: "_self", sortOrder: 1, enabled: true },
    { id: "blog", label: "Blog", href: "/blog", target: "_self", sortOrder: 2, enabled: true },
  ],
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const res = await fetch(`${API_BASE}/site/settings`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return DEFAULT_PUBLIC_SITE;
    const data = (await res.json()) as Partial<PublicSiteSettings>;
    const tagline = data.tagline?.trim();
    const heroTitle = data.heroTitle?.trim();
    const heroSubtitle = data.heroSubtitle?.trim();
    return {
      ...DEFAULT_PUBLIC_SITE,
      ...data,
      tagline: tagline || DEFAULT_PUBLIC_SITE.tagline,
      heroTitle: heroTitle || DEFAULT_PUBLIC_SITE.heroTitle,
      heroSubtitle: heroSubtitle || DEFAULT_PUBLIC_SITE.heroSubtitle,
      gallery: { ...DEFAULT_PUBLIC_SITE.gallery, ...data.gallery },
      navigation:
        Array.isArray(data.navigation) && data.navigation.length > 0
          ? data.navigation
          : DEFAULT_PUBLIC_SITE.navigation,
    };
  } catch {
    return DEFAULT_PUBLIC_SITE;
  }
}
