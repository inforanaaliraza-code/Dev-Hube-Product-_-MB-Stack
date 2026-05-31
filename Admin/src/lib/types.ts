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
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  galleryBend: number;
  galleryScrollSpeed: number;
  galleryScrollEase: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  urlPath: string;
  url: string;
  alt: string | null;
  createdAt: string;
}

export type CmsContentType = "page" | "post";
export type CmsContentStatus = "draft" | "published";

export interface CmsContent {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  type: CmsContentType;
  status: CmsContentStatus;
  featuredImageId: string | null;
  publishedAt: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsContentInput {
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  type: CmsContentType;
  status?: CmsContentStatus;
  featuredImageId?: string | null;
}

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  target: "_self" | "_blank";
  sortOrder: number;
  enabled: boolean;
}

export type PluginType = "integration" | "worker" | "extension";
export type PluginStatus = "active" | "inactive";

export interface Plugin {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  type: PluginType;
  status: PluginStatus;
  category: string;
  adminPath: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PluginInput {
  slug: string;
  name: string;
  description?: string;
  version?: string;
  type: PluginType;
  status?: PluginStatus;
  category?: string;
  adminPath?: string | null;
}

export type ToolBlogStatus = "draft" | "published";

export interface ToolBlog {
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
  status: ToolBlogStatus;
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

export interface ToolBlogInput {
  title: string;
  excerpt?: string;
  body?: string;
  status: ToolBlogStatus;
  featuredImageId?: string | null;
  featuredImageAlt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  metaKeywords?: string[];
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageId?: string | null;
  ogImageAlt?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterCard?: string;
  authorName?: string | null;
  articleSection?: string | null;
  schemaType?: string;
  seoLocale?: string;
  readingTimeMinutes?: number | null;
  autoGenerateSchema?: boolean;
  robots?: string;
  noindex?: boolean;
  nofollow?: boolean;
  schemaJson?: string | null;
}
