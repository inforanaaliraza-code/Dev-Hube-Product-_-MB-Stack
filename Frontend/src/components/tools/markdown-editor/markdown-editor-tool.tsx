"use client";

import { useEffect, useState } from "react";
import { FileCode, Loader2 } from "lucide-react";
import { previewMarkdown } from "@/lib/markdown-editor-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const DEFAULT = `# Hello Dev Hube\n\nWrite **markdown** on the left and preview on the right.\n\n- Live preview\n- Export-ready HTML\n`;

export function MarkdownEditorTool() {
  const [markdown, setMarkdown] = useState(DEFAULT);
  const [html, setHtml] = useState("");
  const { pulse, idle, busy } = useWorkflowRunner();

  useEffect(() => {
    const timer = setTimeout(() => {
      pulse("Rendering preview…");
      previewMarkdown(markdown)
        .then((res) => setHtml(res.html))
        .catch(() => setHtml("<p>Preview unavailable</p>"))
        .finally(() => idle());
    }, 400);
    return () => clearTimeout(timer);
  }, [markdown, pulse, idle]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileCode className="h-5 w-5 text-fuchsia-400" />Markdown</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={22} value={markdown} onChange={(e) => setMarkdown(e.target.value)} className="font-mono text-sm" />
        </CardContent>
      </Card>
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader className="flex flex-row items-center gap-2">
          <CardTitle>Preview</CardTitle>
          {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none min-h-[480px] p-4 rounded-lg border border-border/50 bg-black/20" dangerouslySetInnerHTML={{ __html: html }} />
        </CardContent>
      </Card>
    </div>
  );
}
