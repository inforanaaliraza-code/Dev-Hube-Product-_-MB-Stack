import { Link } from "@tanstack/react-router";
import { Github, Twitter } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 sm:gap-2.5">
            <BrandLogo variant="footer" />
            <p className="text-xs text-muted-foreground max-w-xs">
              Developer utilities, beautifully fast.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/tools" className="hover:text-foreground transition-colors">
              Tools
            </Link>
            <Link to="/" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <a href="/sitemap.xml" className="hover:text-foreground transition-colors">
              Sitemap
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} devhub. Built with TanStack Start & Lovable Cloud.
        </p>
      </div>
    </footer>
  );
}
