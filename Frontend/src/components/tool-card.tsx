"use client";

import { memo } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ToolIcon } from "@/components/tool-icon";
import { TOOL_ACCENT_ICON, TOOL_ACCENT_RING } from "@/lib/tool-visuals";
import { toolHref, type Tool } from "@/lib/tools";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

interface Props {
  tool: Tool;
}

export const ToolCard = memo(function ToolCard({ tool }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={toolHref(tool)} className="block h-full group">
          <Card
            className={cn(
              glassCard,
              "h-full overflow-hidden border-border/70 transition-[transform,box-shadow,border-color] duration-200",
              "hover:-translate-y-0.5 hover:shadow-lg hover:border-border",
            )}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-5 pb-0">
              <div
                className={cn(
                  "h-11 w-11 rounded-xl border grid place-items-center shrink-0 transition-colors",
                  TOOL_ACCENT_RING[tool.accent],
                )}
              >
                <ToolIcon
                  name={tool.icon}
                  className={cn("h-5 w-5", TOOL_ACCENT_ICON[tool.accent])}
                />
              </div>
              <div className="flex items-center gap-1.5">
                {tool.status === "soon" && (
                  <Badge variant="soon" className="text-[10px] gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    Soon
                  </Badge>
                )}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-2">
                {tool.category}
              </p>
              <h3 className="font-display font-semibold text-lg mb-1.5 leading-snug group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {tool.tagline}
              </p>
            </CardContent>
          </Card>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{tool.name}</p>
        <p className="text-primary-foreground/80 mt-0.5">{tool.tagline}</p>
      </TooltipContent>
    </Tooltip>
  );
});
