import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-solid shadow-card rounded-3xl p-10 border border-border">
        <h1 className="font-display text-7xl font-semibold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That route doesn&apos;t exist. Let&apos;s get you back to the hub.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center h-10 px-5 rounded-xl bg-gradient-to-br from-aurora-1 to-aurora-3 text-primary-foreground text-sm font-medium shadow-glow"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
