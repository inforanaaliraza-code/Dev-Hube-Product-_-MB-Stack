"use client";

import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

export function AdminHeader({ title }: { title: string }) {
  const email = useAppSelector((s) => s.auth.email);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/90 backdrop-blur px-4 md:px-6 h-14">
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" className="md:hidden" type="button" aria-label="Menu">
          <Menu className="h-4 w-4" />
        </Button>
        <h1 className="font-semibold text-lg truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[160px]">
          {email}
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link href={siteUrl} target="_blank" rel="noopener noreferrer">
            View site
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
