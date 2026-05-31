"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { getWorkerHealth, humanizeText } from "@/lib/ai-humanizer-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function AiHumanizerTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { run: flowRun, busy } = useWorkflowRunner("ai");
  const { healthy } = useWorkerHealth(getWorkerHealth);

  const run = async () => {
    const text = input.trim();
    if (text.length < 3) return toast.error("Enter text to humanize");
    setError(null);
    setOutput("");
    try {
      await flowRun(async () => {
        const res = await humanizeText(text, "natural");
        const result = (res.result ?? "").trim();
        if (!result) {
          throw new Error("Empty response from AI worker — try shorter text or wait for model to finish loading");
        }
        setOutput(result);
        toast.success("Text humanized");
      }, "Humanizing text…");
    } catch (e) {
      const msg = e instanceof ApiError || e instanceof Error ? e.message : "Failed";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-fuchsia-400" />
            AI text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea rows={12} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste AI-generated text…" />
          <p className="text-xs text-muted-foreground">{input.length} characters · long text is processed in parts</p>
          <Button className="w-full" disabled={busy} onClick={() => void run()}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            {busy ? "Humanizing…" : "Humanize"}
          </Button>
          <WorkerStatusHint healthy={healthy} />
        </CardContent>
      </Card>
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader>
          <CardTitle>Humanized</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {busy ? (
            <p className="text-sm text-amber-400/90 animate-pulse">Processing… first run can take 1–3 minutes on CPU.</p>
          ) : null}
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <Textarea
            rows={12}
            readOnly
            value={output}
            placeholder={busy ? "Working…" : "Humanized text will appear here"}
            className={cn("font-mono text-sm min-h-[280px]", output && "ring-1 ring-fuchsia-500/25")}
          />
          {output ? (
            <p className="text-xs text-muted-foreground">{output.length} characters</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
