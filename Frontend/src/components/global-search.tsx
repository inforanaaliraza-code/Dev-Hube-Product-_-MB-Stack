"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { ArrowRight } from "lucide-react";
import { ToolIcon } from "@/components/tool-icon";
import { TOOL_ACCENT_ICON, TOOL_ACCENT_RING } from "@/lib/tool-visuals";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetGlobalSearch,
  setGlobalSearchOpen,
  setGlobalSearchQuery,
} from "@/store/slices/toolsSlice";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function GlobalSearch() {
  const open = useAppSelector((s) => s.tools.globalSearchOpen);
  const q = useAppSelector((s) => s.tools.globalSearchQuery);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: ["name", "tagline", "category", "keywords"],
        threshold: 0.35,
      }),
    [],
  );

  const results = useMemo(() => {
    if (!q.trim()) return tools.slice(0, 6);
    return fuse.search(q).slice(0, 8).map((r) => r.item);
  }, [q, fuse]);

  useEffect(() => {
    if (!open) dispatch(resetGlobalSearch());
  }, [open, dispatch]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => dispatch(setGlobalSearchOpen(next))}
      shouldFilter={false}
      commandValue={q}
      onCommandValueChange={(value) => dispatch(setGlobalSearchQuery(value))}
      title="Search tools"
    >
      <div className="flex items-center gap-3 border-b border-border pr-3">
        <CommandInput placeholder="Search tools, categories…" className="h-12 flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/60 border border-border cursor-default shrink-0">
              ESC
            </kbd>
          </TooltipTrigger>
          <TooltipContent>Close search</TooltipContent>
        </Tooltip>
      </div>
      <CommandList className="max-h-[50vh] p-2">
        {results.length === 0 ? (
          <CommandEmpty>No tools match &quot;{q}&quot;.</CommandEmpty>
        ) : (
          results.map((t) => (
            <CommandItem
              key={t.slug}
              value={t.slug}
              onSelect={() => {
                dispatch(setGlobalSearchOpen(false));
                router.push(`/tools/${t.slug}`);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg border grid place-items-center shrink-0",
                  TOOL_ACCENT_RING[t.accent],
                )}
              >
                <ToolIcon name={t.icon} className={cn("h-4 w-4", TOOL_ACCENT_ICON[t.accent])} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground truncate">{t.tagline}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t.category}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60" />
            </CommandItem>
          ))
        )}
      </CommandList>
    </CommandDialog>
  );
}
