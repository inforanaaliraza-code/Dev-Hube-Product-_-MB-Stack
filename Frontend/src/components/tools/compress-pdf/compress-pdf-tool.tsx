"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Minimize2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { compressPdfFile, getWorkerHealth, type CompressPdfResult } from "@/lib/compress-pdf-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const MAX_BYTES = 25 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState("medium");
  const [result, setResult] = useState<CompressPdfResult | null>(null);
  const { run: flowRun, busy } = useWorkflowRunner("file");
  const { healthy: workerHealthy } = useWorkerHealth(getWorkerHealth);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (picked?: File) => {
    if (!picked) return;
    if (!picked.name.toLowerCase().endsWith(".pdf") && picked.type !== "application/pdf") {
      toast.error("Only PDF files");
      return;
    }
    if (picked.size > MAX_BYTES) {
      toast.error("Max 25 MB");
      return;
    }
    setFile(picked);
    setResult(null);
  };

  const run = async () => {
    if (!file) return toast.error("Upload a PDF");
    setResult(null);
    try {
      await flowRun(async () => {
        setResult(await compressPdfFile(file, level));
        toast.success("PDF compressed");
      }, "Compressing PDF…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className={cn(glassCard, "border-border/60 h-fit")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Minimize2 className="h-5 w-5 text-emerald-400" />
            Compress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
          <Button className="w-full" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
          {file ? <p className="text-xs truncate">{file.name} · {formatBytes(file.size)}</p> : null}
          <div className="space-y-2">
            <Label>Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" disabled={!file || busy} onClick={() => void run()}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Minimize2 className="h-4 w-4 mr-2" />}
            Compress
          </Button>
          {file ? <Button variant="ghost" className="w-full" onClick={() => { setFile(null); setResult(null); }}><Trash2 className="h-4 w-4 mr-2" />Clear</Button> : null}
          <WorkerStatusHint healthy={workerHealthy} />
        </CardContent>
      </Card>
      <div className="space-y-4">
        {result ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm">Saved {result.savedPercent}% ({formatBytes(result.savedBytes)})</p>
              <p className="text-sm text-muted-foreground">{formatBytes(result.originalBytes)} → {formatBytes(result.compressedBytes)}</p>
              <Button className="w-full" onClick={() => {
                const a = document.createElement("a");
                a.href = `data:application/pdf;base64,${result.pdfBase64}`;
                a.download = result.filename;
                a.click();
              }}>
                <Download className="h-4 w-4 mr-2" />
                Download {result.filename}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
