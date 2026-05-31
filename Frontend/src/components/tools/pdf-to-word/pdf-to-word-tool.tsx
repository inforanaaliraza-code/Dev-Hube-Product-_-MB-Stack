"use client";

import { useCallback, useRef, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  convertPdfToWord,
  getWorkerHealth,
  type ConvertPdfResult,
} from "@/lib/pdf-to-word-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

function downloadDocx(result: ConvertPdfResult) {
  const link = document.createElement("a");
  link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${result.docxBase64}`;
  link.download = result.filename;
  link.click();
}

export function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ConvertPdfResult | null>(null);
  const [usePageRange, setUsePageRange] = useState(false);
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("");
  const { run: flowRun, busy: converting } = useWorkflowRunner("file");
  const { healthy: workerHealthy } = useWorkerHealth(getWorkerHealth);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback((picked: File | undefined) => {
    if (!picked) return;
    if (picked.type !== "application/pdf" && !picked.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }
    if (picked.size > MAX_BYTES) {
      toast.error("PDF must be under 25 MB");
      return;
    }
    setFile(picked);
    setResult(null);
    setEndPage("");
  }, []);

  const handleConvert = async () => {
    if (!file) {
      toast.error("Upload a PDF first");
      return;
    }

    const options: { startPage?: number; endPage?: number } = {};
    if (usePageRange) {
      const start = parseInt(startPage, 10);
      const end = endPage.trim() ? parseInt(endPage, 10) : undefined;
      if (!Number.isFinite(start) || start < 1) {
        toast.error("Enter a valid start page");
        return;
      }
      options.startPage = start;
      if (end != null) {
        if (!Number.isFinite(end) || end < start) {
          toast.error("End page must be >= start page");
          return;
        }
        options.endPage = end;
      }
    }

    setResult(null);
    try {
      await flowRun(async () => {
        const converted = await convertPdfToWord(file, options);
        setResult(converted);
        toast.success("DOCX ready to download");
      }, "Converting to Word…");
    } catch (err) {
      toast.error(err instanceof ApiError || err instanceof Error ? err.message : "Conversion failed");
    }
  };

  const clearAll = () => {
    setFile(null);
    setResult(null);
    setStartPage("1");
    setEndPage("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className={cn(glassCard, "border-border/60 h-fit")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            Convert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <Button className="w-full" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>

          {file ? (
            <div className="rounded-lg border border-border/60 px-3 py-2 text-sm">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatBytes(file.size)}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Max 25 MB · layout-preserving DOCX</p>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <Label htmlFor="page-range" className="text-sm cursor-pointer">
              Page range
            </Label>
            <Switch
              id="page-range"
              checked={usePageRange}
              onCheckedChange={setUsePageRange}
            />
          </div>

          {usePageRange ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>From page</Label>
                <Input
                  type="number"
                  min={1}
                  value={startPage}
                  onChange={(e) => setStartPage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>To page</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="All"
                  value={endPage}
                  onChange={(e) => setEndPage(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          <Button
            className="w-full"
            onClick={() => void handleConvert()}
            disabled={!file || converting}
          >
            {converting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Convert to Word
          </Button>

          {file ? (
            <Button variant="ghost" className="w-full" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          ) : null}

          <WorkerStatusHint healthy={workerHealthy} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div
          className={cn(
            glassCard,
            "rounded-xl border border-dashed border-border/80 p-12 text-center",
            "hover:border-cyan-500/40 transition-colors",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            e.preventDefault();
            pickFile(e.dataTransfer.files?.[0]);
          }}
        >
          <FileText className="h-12 w-12 mx-auto text-cyan-400 mb-4" />
          <p className="font-medium text-lg">Drop your PDF here</p>
          <p className="text-sm text-muted-foreground mt-2">
            Editable DOCX with layout preservation via pdf2docx
          </p>
        </div>

        {converting ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <p className="text-muted-foreground">Converting PDF to Word…</p>
              <p className="text-xs text-muted-foreground">Large files may take a minute</p>
            </CardContent>
          </Card>
        ) : null}

        {result && !converting ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Ready</CardTitle>
              <Badge variant="secondary" className="text-emerald-600">
                {result.convertedPages} page{result.convertedPages === 1 ? "" : "s"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-muted-foreground text-xs">PDF size</p>
                  <p className="font-medium mt-1">{formatBytes(result.originalBytes)}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-muted-foreground text-xs">DOCX size</p>
                  <p className="font-medium mt-1">{formatBytes(result.docxBytes)}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-muted-foreground text-xs">Total PDF pages</p>
                  <p className="font-medium mt-1">{result.pageCount}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-muted-foreground text-xs">Output file</p>
                  <p className="font-medium mt-1 truncate">{result.filename}</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => downloadDocx(result)}>
                <Download className="h-4 w-4 mr-2" />
                Download DOCX
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => void handleConvert()}
                disabled={!file}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Convert again
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!result && !converting && file ? (
          <p className="text-center text-sm text-muted-foreground">
            Click Convert to Word to generate your DOCX
          </p>
        ) : null}
      </div>
    </div>
  );
}
