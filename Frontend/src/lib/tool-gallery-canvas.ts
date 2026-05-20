import type { Tool } from "@/lib/tools";
import type { GalleryItem } from "@/lib/gallery-items";

const accentGradients: Record<Tool["accent"], [string, string]> = {
  violet: ["#8b5cf6", "#4c1d95"],
  cyan: ["#22d3ee", "#0e7490"],
  fuchsia: ["#e879f9", "#a21caf"],
  amber: ["#fbbf24", "#b45309"],
  emerald: ["#34d399", "#047857"],
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function createToolGalleryItem(tool: Tool): Promise<GalleryItem> {
  const width = 700;
  const height = 900;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { image: "", text: tool.name };
  }

  const [from, to] = accentGradients[tool.accent];
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, from);
  gradient.addColorStop(0.55, to);
  gradient.addColorStop(1, "#0c0c12");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.arc(width * 0.85, height * 0.12, width * 0.35, 0, Math.PI * 2);
  ctx.fill();

  try {
    const iconUrl = `https://api.iconify.design/lucide/${tool.icon}.svg?color=%23ffffff&width=200&height=200`;
    const iconImg = await loadImage(iconUrl);
    const iconSize = Math.min(width, height) * 0.28;
    const iconX = (width - iconSize) / 2;
    const iconY = height * 0.32;
    ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize);
  } catch {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 120px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tool.name.charAt(0).toUpperCase(), width / 2, height * 0.42);
  }

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = '600 28px "Space Grotesk", system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(tool.category, width / 2, height * 0.72);

  return {
    image: canvas.toDataURL("image/png"),
    text: tool.name,
  };
}

export async function buildToolsGalleryItems(toolList: Tool[]): Promise<GalleryItem[]> {
  return Promise.all(toolList.map((tool) => createToolGalleryItem(tool)));
}
