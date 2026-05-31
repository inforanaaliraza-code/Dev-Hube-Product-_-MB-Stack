"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { evaluateToolBlogSeo } from "@/lib/tool-blog-seo";
import type { ToolBlog } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ToolBlogSeoChecklist({
  blog,
  siteUrl,
}: {
  blog: ToolBlog;
  siteUrl: string;
}) {
  const { score, checks } = evaluateToolBlogSeo(blog, siteUrl.replace(/\/$/, ""));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">SEO score</span>
        <span
          className={cn(
            "text-lg font-semibold tabular-nums",
            score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-orange-400",
          )}
        >
          {score}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-orange-500",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {checks.map((c) => (
          <li key={c.id} className="flex gap-2 text-xs leading-snug">
            {c.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>
              {c.label}
              {c.hint ? <span className="block text-[10px] opacity-80">{c.hint}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
