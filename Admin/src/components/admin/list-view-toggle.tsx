"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import type { ListViewMode } from "@/hooks/use-list-view";
import { cn } from "@/lib/utils";

export function ListViewToggle({
  value,
  onChange,
}: {
  value: ListViewMode;
  onChange: (mode: ListViewMode) => void;
}) {
  return (
    <div className="wp-list-view-toggle" role="group" aria-label="View mode">
      <button
        type="button"
        className={cn("wp-list-view-btn", value === "table" && "wp-list-view-btn-active")}
        onClick={() => onChange("table")}
        aria-pressed={value === "table"}
        title="Table view"
      >
        <LayoutList className="h-4 w-4" />
        <span className="sr-only">Table</span>
      </button>
      <button
        type="button"
        className={cn("wp-list-view-btn", value === "grid" && "wp-list-view-btn-active")}
        onClick={() => onChange("grid")}
        aria-pressed={value === "grid"}
        title="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grid</span>
      </button>
    </div>
  );
}
