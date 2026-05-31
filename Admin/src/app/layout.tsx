import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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

const adminOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(adminOrigin),
  title: "Dev Hube Admin",
  description: "Manage Dev Hube tools, content, and site settings",
  icons: {
    icon: [{ url: "/fevicon.png", type: "image/png" }],
    shortcut: [{ url: "/fevicon.png", type: "image/png" }],
    apple: [{ url: "/fevicon.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
