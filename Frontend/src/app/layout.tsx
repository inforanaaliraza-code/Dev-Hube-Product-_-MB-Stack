import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MaintenanceGate } from "@/components/maintenance-gate";
import { Providers } from "./providers";
import "@/styles.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dev Hube — Developer Utility Hub",
    template: "%s — Dev Hube",
  },
  description:
    "50+ developer utilities: temp mail, QR codes, PDF tools, AI generators, SEO and more in one hub.",
  icons: {
    icon: "/fevicon.png",
    shortcut: "/fevicon.png",
    apple: "/fevicon.png",
  },
  openGraph: {
    siteName: "Dev Hube",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#16142a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <SiteHeader />
            <main className="relative flex-1 z-10">
              <MaintenanceGate>{children}</MaintenanceGate>
            </main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
