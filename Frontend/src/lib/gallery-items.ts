import type { Tool } from "@/lib/tools";
import { tools } from "@/lib/tools";

export interface GalleryItem {
  image: string;
  text: string;
}

export function getToolsForGallery(allTools: Tool[] = tools): Tool[] {
  const featured = allTools.filter((t) => t.featured);
  return featured.length >= 12 ? featured : allTools;
}
