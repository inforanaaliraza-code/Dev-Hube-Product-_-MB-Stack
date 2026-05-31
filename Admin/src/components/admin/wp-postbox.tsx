"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function WpPostbox({
  title,
  children,
  className,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("wp-postbox", className)}>
      <div className="wp-postbox-header">
        <h2 className="wp-postbox-title">{title}</h2>
        <button
          type="button"
          className="wp-postbox-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {open ? <div className="wp-postbox-inside">{children}</div> : null}
    </div>
  );
}
