import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Image,
  LayoutDashboard,
  Newspaper,
  Palette,
  Plug,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

export type WpSubMenuItem = {
  label: string;
  href: string;
};

export type WpMenuItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  submenu?: WpSubMenuItem[];
};

export const WP_MENU: WpMenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    submenu: [
      { label: "Home", href: "/" },
      { label: "Updates", href: "/updates" },
    ],
  },
  {
    id: "media",
    label: "Media",
    href: "/media",
    icon: Image,
    submenu: [{ label: "Library", href: "/media" }],
  },
  {
    id: "posts",
    label: "Blog Posts",
    href: "/posts",
    icon: Newspaper,
    submenu: [
      { label: "All Blog Posts", href: "/posts" },
      { label: "Add New", href: "/posts/new" },
    ],
  },
  {
    id: "pages",
    label: "Pages",
    href: "/pages",
    icon: FileText,
    submenu: [
      { label: "All Pages", href: "/pages" },
      { label: "Add New", href: "/pages/new" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    href: "/tools",
    icon: Wrench,
    submenu: [
      { label: "All Tools", href: "/tools" },
      { label: "Add New", href: "/tools/new" },
      { label: "Categories", href: "/categories" },
    ],
  },
  {
    id: "appearance",
    label: "Appearance",
    href: "/gallery",
    icon: Palette,
    submenu: [
      { label: "Gallery", href: "/gallery" },
      { label: "Menus", href: "/appearance/menus" },
      { label: "Customize", href: "/settings/general" },
    ],
  },
  {
    id: "plugins",
    label: "Plugins",
    href: "/plugins",
    icon: Plug,
    submenu: [
      { label: "Installed", href: "/plugins" },
      { label: "Add New", href: "/plugins/new" },
      { label: "Site Kit", href: "/site-kit" },
    ],
  },
  {
    id: "users",
    label: "Users",
    href: "/users",
    icon: Users,
    submenu: [
      { label: "Administrators", href: "/users" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings/general",
    icon: Settings,
    submenu: [
      { label: "General", href: "/settings/general" },
      { label: "Gallery", href: "/settings/gallery" },
      { label: "Frontend", href: "/settings/frontend" },
    ],
  },
];

export function isMenuActive(pathname: string, item: WpMenuItem): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isSubActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
