"use client";

import { useRef, useState } from "react";
import { Loader2, Mic, Upload } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { getWorkerHealth, transcribeAudio } from "@/lib/speech-to-text-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function SpeechToTextTool() {
  const [text, setText] = useState("");
  const [meta, setMeta] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner("file");
  const { healthy } = useWorkerHealth(getWorkerHealth);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async (file?: File) => {
    if (!file) return;
    try {
      await flowRun(async () => {
        const res = await transcribeAudio(file);
        setText(res.text);
        setMeta(`Language: ${res.language} · Duration: ${res.durationSeconds.toFixed(1)}s`);
        toast.success("Transcription complete");
      }, "Transcribing audio…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <Card className={cn(glassCard, "border-border/60 max-w-4xl mx-auto")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-emerald-400" />
          Speech to Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input ref={inputRef} type="file" accept=".wav,.mp3,.m4a,.webm,.ogg,.flac,audio/*" className="hidden" onChange={(e) => void run(e.target.files?.[0])} />
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload audio
        </Button>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
        <Textarea rows={14} value={text} readOnly className="font-mono text-sm" />
        <WorkerStatusHint healthy={healthy} />
        {healthy === false ? (
          <p className="text-xs text-muted-foreground">ffmpeg recommended for mp3 files.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
