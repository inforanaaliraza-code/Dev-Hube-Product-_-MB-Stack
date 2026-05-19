import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Variant = "header" | "footer";

interface Props {
  variant?: Variant;
  className?: string;
  linked?: boolean;
}

const sizes: Record<Variant, string> = {
  header: "h-10 sm:h-11 w-auto max-w-[min(55vw,200px)]",
  footer: "h-11 sm:h-12 w-auto max-w-[min(60vw,220px)]",
};

export function BrandLogo({ variant = "header", className, linked = true }: Props) {
  const img = (
    <img
      src="/logo.png"
      alt="DevHub"
      width={200}
      height={48}
      decoding="async"
      fetchPriority={variant === "header" ? "high" : "auto"}
      className={cn(
        sizes[variant],
        "object-contain object-left select-none",
        "drop-shadow-[0_0_14px_rgb(168_85_247/0.35)]",
        className,
      )}
    />
  );

  if (!linked) return img;

  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-opacity hover:opacity-90 active:opacity-95"
      aria-label="DevHub home"
    >
      {img}
    </Link>
  );
}
