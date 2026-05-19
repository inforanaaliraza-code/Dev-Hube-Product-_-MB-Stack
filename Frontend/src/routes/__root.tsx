import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-solid shadow-card rounded-3xl p-10 border border-border">
        <h1 className="font-display text-7xl font-semibold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That route doesn't exist. Let's get you back to the hub.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center h-10 px-5 rounded-xl bg-gradient-to-br from-aurora-1 to-aurora-3 text-primary-foreground text-sm font-medium shadow-glow"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-solid shadow-card rounded-3xl p-10 border border-border">
        <h1 className="font-display text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head home.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="h-10 px-5 rounded-xl bg-gradient-to-br from-aurora-1 to-aurora-3 text-primary-foreground text-sm font-medium shadow-glow"
          >
            Try again
          </button>
          <a
            href="/"
            className="h-10 px-5 rounded-xl glass-solid text-sm font-medium inline-flex items-center border border-border"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "devhub — Developer Utility Hub" },
      {
        name: "description",
        content:
          "50+ developer utilities: temp mail, QR codes, PDF tools, AI generators, SEO and more in one hub.",
      },
      { name: "theme-color", content: "#16142a" },
      { property: "og:site_name", content: "devhub" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="relative min-h-screen flex flex-col">
          <SiteHeader />
          <main className="relative flex-1 z-10">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
