import { memo } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { accentClass, type Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

interface Props {
  tool: Tool;
}

export const ToolCard = memo(function ToolCard({ tool }: Props) {
  const Icon = tool.icon;

  return (
    <Link
      to="/tools"
      className={cn(
        "group relative block h-full rounded-2xl glass-solid shadow-card p-5 overflow-hidden",
        "border border-border transition-[transform,box-shadow] duration-200 ease-out",
        "hover:-translate-y-1 hover:shadow-3d",
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className={cn(
            "h-12 w-12 rounded-xl bg-gradient-to-br grid place-items-center shrink-0",
            accentClass[tool.accent],
          )}
        >
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-1.5">
          {tool.status === "soon" && (
            <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground inline-flex items-center gap-1 border border-border">
              <Sparkles className="h-2.5 w-2.5" />
              Soon
            </span>
          )}
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
          {tool.category}
        </p>
        <h3 className="font-display font-semibold text-lg mb-1.5">{tool.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>
    </Link>
  );
});
