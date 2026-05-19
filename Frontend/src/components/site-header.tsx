import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, Search, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./theme-provider";
import { GlobalSearch } from "./global-search";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Tools" },
  { to: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled ? "py-2" : "py-4",
        )}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl px-3 sm:px-4 h-14 ring-aurora",
              scrolled ? "glass shadow-card" : "bg-transparent",
            )}
          >
            <BrandLogo variant="header" />

            <nav className="hidden md:flex items-center gap-1">
              {nav.map((n) => {
                const active =
                  n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "relative px-3 py-1.5 text-sm rounded-lg transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
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
            </nav>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 hover:bg-secondary/70 transition-colors h-9 px-3 rounded-lg border border-border"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search tools…</span>
                <kbd className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/60 border border-border">
                  ⌘K
                </kbd>
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary/60"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                onClick={toggle}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary/60 transition-colors"
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
              </button>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary/60"
                aria-label="Menu"
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="md:hidden mt-2 glass rounded-2xl p-2"
              >
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm hover:bg-secondary/60"
                  >
                    {n.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
