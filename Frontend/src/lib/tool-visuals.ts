import type { LucideIcon } from "lucide-react";
import {
  Braces,
  Code2,
  Shield,
  Type,
  Wrench,
} from "lucide-react";

export type ToolNavIconName = "text" | "code" | "data" | "security" | "utilities";

export const TOOL_NAV_ICON_MAP: Record<ToolNavIconName, LucideIcon> = {
  text: Type,
  code: Code2,
  data: Braces,
  security: Shield,
  utilities: Wrench,
};

export const TOOL_ACCENT_ICON: Record<
  "violet" | "cyan" | "fuchsia" | "amber" | "emerald",
  string
> = {
  violet: "text-violet-400",
  cyan: "text-cyan-400",
  fuchsia: "text-fuchsia-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
};

export const TOOL_ACCENT_RING: Record<
  "violet" | "cyan" | "fuchsia" | "amber" | "emerald",
  string
> = {
  violet: "border-violet-500/25 bg-violet-500/10 group-hover:border-violet-400/40 group-hover:bg-violet-500/15",
  cyan: "border-cyan-500/25 bg-cyan-500/10 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/15",
  fuchsia: "border-fuchsia-500/25 bg-fuchsia-500/10 group-hover:border-fuchsia-400/40 group-hover:bg-fuchsia-500/15",
  amber: "border-amber-500/25 bg-amber-500/10 group-hover:border-amber-400/40 group-hover:bg-amber-500/15",
  emerald: "border-emerald-500/25 bg-emerald-500/10 group-hover:border-emerald-400/40 group-hover:bg-emerald-500/15",
};
