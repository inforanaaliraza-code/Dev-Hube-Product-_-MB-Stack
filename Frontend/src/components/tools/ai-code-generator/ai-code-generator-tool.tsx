"use client";

import { useState } from "react";
import { Bot, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { generateCode, getWorkerHealth } from "@/lib/ai-code-generator-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type AiHealth = {
  ok: boolean;
  configured: boolean;
  provider?: string;
  model_state?: string;
};

export function AiCodeGeneratorTool() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner("ai");
  const { healthy, data: health } = useWorkerHealth<AiHealth>(getWorkerHealth);

  const run = async () => {
    if (prompt.trim().length < 3) return toast.error("Describe what to generate");
    try {
      await flowRun(async () => {
        const res = await generateCode(prompt.trim(), language);
        setCode(res.code);
        toast.success("Code generated");
      }, "AI generating code…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-violet-400" />Prompt</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["typescript", "javascript", "python", "java", "go", "rust", "sql", "html"].map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea rows={10} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the function or feature..." />
          <Button className="w-full" disabled={busy} onClick={() => void run()}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
            Generate
          </Button>
          <WorkerStatusHint healthy={healthy} />
          {health?.ok && !health.configured && health.provider === "ollama" ? (
            <p className="text-xs text-amber-500">AI_PROVIDER=ollama but Ollama is off — set AI_PROVIDER=openai in Backend\.env</p>
          ) : null}
          {health?.ok && health.model_state === "loading" ? (
            <p className="text-xs text-amber-500">Model loading in worker — wait, do not close terminal</p>
          ) : null}
        </CardContent>
      </Card>
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Output</CardTitle>
          {code ? <Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(code); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button> : null}
        </CardHeader>
        <CardContent>
          <pre className={cn("text-sm overflow-auto max-h-[480px] p-4 rounded-lg bg-black/40 border border-border/50 whitespace-pre-wrap fade-in", code && "ring-1 ring-violet-500/30")}>{code || "Generated code appears here"}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
