import type { WorkflowVariant } from "@/components/tools/shared/tool-workflow";

export const TOOL_WORKFLOW_VARIANT: Record<string, WorkflowVariant> = {
  "temp-mail": "stream",
  "qr-generator": "api",
  "image-compressor": "file",
  "pdf-to-word": "file",
  "merge-pdf": "file",
  "split-pdf": "file",
  "compress-pdf": "file",
  "ai-code-generator": "ai",
  "sql-formatter": "api",
  "password-generator": "api",
  "palette-generator": "api",
  "markdown-editor": "api",
  "ai-resume-builder": "ai",
  "youtube-thumbnail": "api",
  "image-to-text": "file",
  "speech-to-text": "file",
  "ai-paraphrase": "ai",
  "ai-humanizer": "ai",
  "whois-lookup": "api",
  "ip-lookup": "api",
  "speed-test": "api",
  "image-converter": "file",
};

export function workflowVariantForSlug(slug: string): WorkflowVariant {
  return TOOL_WORKFLOW_VARIANT[slug] ?? "api";
}
