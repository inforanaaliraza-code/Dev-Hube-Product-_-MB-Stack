export type ToolAccent = "violet" | "cyan" | "fuchsia" | "amber" | "emerald";
export type ToolStatus = "ready" | "soon";

export interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  icon: string;
  accent: ToolAccent;
  status: ToolStatus;
  keywords: string[];
  featured?: boolean;
}

export interface ToolInput {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  icon: string;
  accent: ToolAccent;
  status: ToolStatus;
  keywords: string[];
  featured?: boolean;
}

export interface CategoriesResponse {
  categories: string[];
  counts: Record<string, number>;
  total: number;
}

export interface SiteSettings {
  siteName: string;
  publicSiteUrl: string;
  maintenanceMode: boolean;
  galleryBend: number;
  galleryScrollSpeed: number;
}
