import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { tools } from "@/lib/tools";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: Props) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

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
    if (!open) setQ("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-md grid place-items-start pt-[12vh] px-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl glass shadow-3d rounded-2xl overflow-hidden ring-aurora"
          >
            <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tools, categories…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/60 border border-border">
                ESC
              </kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground p-6 text-center">
                  No tools match "{q}".
                </p>
              ) : (
                results.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => {
                        onOpenChange(false);
                        navigate({ to: "/tools" });
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors text-left group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-secondary/60 grid place-items-center">
                        <Icon className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t.tagline}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.category}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
