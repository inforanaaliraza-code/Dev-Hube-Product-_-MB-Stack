import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/tools`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${baseUrl}/tools/${t.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...toolRoutes];
}
