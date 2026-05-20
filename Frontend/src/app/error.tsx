"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-solid shadow-card rounded-3xl p-10 border border-border">
        <h1 className="font-display text-xl font-semibold">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head home.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="h-10 px-5 rounded-xl bg-gradient-to-br from-aurora-1 to-aurora-3 text-primary-foreground text-sm font-medium shadow-glow"
          >
            Try again
          </button>
          <Link
            href="/"
            className="h-10 px-5 rounded-xl glass-solid text-sm font-medium inline-flex items-center border border-border"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
