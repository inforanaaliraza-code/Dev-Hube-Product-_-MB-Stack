"use client";

import type { ReactNode } from "react";
import { ToolPageShell } from "@/components/tools/shared/tool-workflow";
import { workflowVariantForSlug } from "@/lib/tool-workflow-variants";

export function ToolPageWorkflowShell({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  return <ToolPageShell variant={workflowVariantForSlug(slug)}>{children}</ToolPageShell>;
}
