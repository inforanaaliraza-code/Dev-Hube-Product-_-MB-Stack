"use client";

import { useRef, useState } from "react";
import { Copy, Loader2, ScanText, Upload } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { extractTextFromImage, getWorkerHealth } from "@/lib/image-to-text-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function ImageToTextTool() {
  const [text, setText] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner("file");
  const { healthy } = useWorkerHealth(getWorkerHealth);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async (file?: File) => {
    if (!file) return;
    try {
      await flowRun(async () => {
        const res = await extractTextFromImage(file);
        setText(res.text || "");
        toast.success(res.text ? "Text extracted" : "No text found in image");
      }, "Running OCR…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "OCR failed");
    }
  };

  return (
    <Card className={cn(glassCard, "border-border/60 max-w-4xl mx-auto")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanText className="h-5 w-5 text-cyan-400" />
          Screenshot to Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void run(e.target.files?.[0])} />
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload image
        </Button>
        <Textarea rows={14} value={text} readOnly placeholder="Extracted text..." className="font-mono text-sm" />
        {text ? (
          <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(text); toast.success("Copied"); }}>
            <Copy className="h-4 w-4 mr-2" />
            Copy text
          </Button>
        ) : null}
        <WorkerStatusHint healthy={healthy} />
      </CardContent>
    </Card>
  );
}
