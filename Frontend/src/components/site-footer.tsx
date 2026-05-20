import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
            <Link href="/tools" className="hover:text-foreground transition-colors">
              Tools
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <a href="/sitemap.xml" className="hover:text-foreground transition-colors">
              Sitemap
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a href="#" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="#" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dev Hube. Built with Next.js & TypeScript.
        </p>
      </div>
    </footer>
  );
}
