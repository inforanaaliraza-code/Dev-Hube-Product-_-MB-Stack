"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Search, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { GlobalSearch } from "./global-search";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { setGlobalSearchOpen } from "@/store/slices/toolsSlice";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ToolsNavMenu, ToolsNavMobileLinks } from "@/components/tools-nav-menu";

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const dispatch = useAppDispatch();
  const { settings } = useSiteSettings();
  const nav = settings.navigation
    .filter((n) => n.href !== "/tools")
    .map((n) => ({
      href: n.href,
      label: n.label,
      target: n.target,
    }));
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch(setGlobalSearchOpen(true));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled ? "py-1.5" : "py-3",
        )}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div
            className={cn(
              "rounded-2xl px-3 sm:px-4 ring-aurora transition-all duration-300",
              scrolled ? "glass shadow-card py-2" : "bg-transparent py-1",
            )}
          >
            <div className="flex items-center gap-3 h-12">
              <BrandLogo variant="header" />

              <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
                {nav.map((n) => {
                  const active =
                    n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      target={n.target === "_blank" ? "_blank" : undefined}
                      rel={n.target === "_blank" ? "noopener noreferrer" : undefined}
                      className={cn(
                        "relative px-2.5 py-1.5 text-[13px] rounded-lg transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/45",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-lg bg-secondary/60"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative">{n.label}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/tools"
                  className={cn(
                    "relative px-2.5 py-1.5 text-[13px] rounded-lg transition-colors",
                    pathname.startsWith("/tools")
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/45",
                  )}
                >
                  {pathname.startsWith("/tools") && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-secondary/60"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">All tools</span>
                </Link>
              </nav>

              <div className="hidden lg:flex flex-1 min-w-0 items-center gap-2 px-1 overflow-x-auto">
                <span className="h-5 w-px bg-border/80 shrink-0" aria-hidden />
                <ToolsNavMenu />
              </div>

              <div className="flex items-center gap-1.5 ml-auto shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch(setGlobalSearchOpen(true))}
                      className="hidden sm:flex h-9 gap-2 text-xs text-muted-foreground bg-secondary/30 border-border/70 hover:bg-secondary/50"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Search tools…</span>
                      <kbd className="hidden lg:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/60 border border-border/80">
                        ⌘K
                      </kbd>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search all tools (⌘K)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => dispatch(setGlobalSearchOpen(true))}
                      className="sm:hidden h-9 w-9"
                      aria-label="Search"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search tools</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={toggle}
                      className="h-9 w-9"
                      aria-label="Toggle theme"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={theme}
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {theme === "dark" ? (
                            <Sun className="h-4 w-4" />
                          ) : (
                            <Moon className="h-4 w-4" />
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setMenuOpen((v) => !v)}
                      className="lg:hidden h-9 w-9"
                      aria-label="Menu"
                    >
                      {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{menuOpen ? "Close menu" : "Open menu"}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="lg:hidden mt-2 glass rounded-2xl p-2 max-h-[70vh] overflow-y-auto"
              >
                {nav.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    target={n.target === "_blank" ? "_blank" : undefined}
                    rel={n.target === "_blank" ? "noopener noreferrer" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm hover:bg-secondary/60"
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  href="/tools"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm hover:bg-secondary/60"
                >
                  All tools
                </Link>
                <ToolsNavMobileLinks onNavigate={() => setMenuOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <GlobalSearch />
    </>
  );
}
