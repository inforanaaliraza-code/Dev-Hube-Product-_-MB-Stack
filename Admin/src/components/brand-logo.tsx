import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "sidebar" | "login";

interface Props {
  variant?: Variant;
  className?: string;
  linked?: boolean;
}

const sizes: Record<Variant, string> = {
  sidebar: "h-9 w-auto max-w-[180px]",
  login: "h-12 w-auto max-w-[220px] mx-auto object-center",
};

export function BrandLogo({ variant = "sidebar", className, linked = true }: Props) {
  const img = (
    <Image
      src="/logo.png"
      alt="Dev Hube"
      width={220}
      height={52}
      priority
      className={cn(sizes[variant], "object-contain object-left select-none", className)}
    />
  );

  if (!linked) return img;

  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Dev Hube Admin home"
    >
      {img}
    </Link>
  );
}
