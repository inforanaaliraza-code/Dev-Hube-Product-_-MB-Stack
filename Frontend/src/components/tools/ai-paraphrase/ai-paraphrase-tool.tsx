"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { getWorkerHealth, paraphraseText } from "@/lib/ai-paraphrase-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function AiParaphraseTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { run: flowRun, busy } = useWorkflowRunner("ai");
  const { healthy } = useWorkerHealth(getWorkerHealth);

  const run = async () => {
    const text = input.trim();
    if (text.length < 3) return toast.error("Enter text to paraphrase");
    setError(null);
    setOutput("");
    try {
      await flowRun(async () => {
        const res = await paraphraseText(text, "neutral");
        const result = (res.result ?? "").trim();
        if (!result) {
          throw new Error("Empty response from AI worker");
        }
        setOutput(result);
        toast.success("Text paraphrased");
      }, "AI rewriting…");
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
            <RefreshCw className="h-5 w-5 text-violet-400" />
            Original
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea rows={12} value={input} onChange={(e) => setInput(e.target.value)} />
          <Button className="w-full" disabled={busy} onClick={() => void run()}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Paraphrase
          </Button>
          <WorkerStatusHint healthy={healthy} />
        </CardContent>
      </Card>
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {busy ? <p className="text-sm text-amber-400/90 animate-pulse">Processing… may take 1–3 min on CPU.</p> : null}
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <Textarea
            rows={12}
            readOnly
            value={output}
            placeholder={busy ? "Working…" : "Paraphrased text appears here"}
            className={cn("min-h-[280px] text-sm", output && "ring-1 ring-violet-500/25")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
