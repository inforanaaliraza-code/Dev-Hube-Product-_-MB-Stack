"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderTree,
  Gauge,
  Image,
  LogOut,
  Settings,
  Wrench,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";

const links = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/gallery", label: "Gallery", icon: Image },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card min-h-screen">
      <div className="p-5 border-b border-border">
        <BrandLogo variant="sidebar" />
        <p className="text-xs text-muted-foreground mt-1">Project control panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => {
            dispatch(logout());
            router.replace("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
