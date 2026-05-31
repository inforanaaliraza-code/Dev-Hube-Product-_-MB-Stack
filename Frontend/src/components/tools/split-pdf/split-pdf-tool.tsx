"use client";

import { useCallback, useRef, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  Scissors,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  getWorkerHealth,
  inspectPdfFile,
  splitPdfFile,
  type SplitPdfResult,
} from "@/lib/split-pdf-api";
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

function downloadResult(result: SplitPdfResult) {
  const link = document.createElement("a");
  if (result.mode === "each") {
    link.href = `data:application/zip;base64,${result.zipBase64}`;
    link.download = result.filename;
  } else {
    link.href = `data:application/pdf;base64,${result.pdfBase64}`;
    link.download = result.filename;
  }
  link.click();
}

export function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SplitPdfResult | null>(null);
  const [splitEachPage, setSplitEachPage] = useState(false);
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("");
  const { run: flowRun, pulse, idle, busy: splitting } = useWorkflowRunner("file");
  const { healthy: workerHealthy } = useWorkerHealth(getWorkerHealth);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [inspecting, setInspecting] = useState(false);
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
    setStartPage("1");
    setEndPage("");
    setPageCount(null);
    setInspecting(true);
    pulse("Reading PDF pages…");
    inspectPdfFile(picked)
      .then((info) => {
        setPageCount(info.pageCount);
        setStartPage("1");
        setEndPage(String(info.pageCount));
      })
      .catch((err) => {
        toast.error(err instanceof ApiError || err instanceof Error ? err.message : "Could not read PDF");
        setFile(null);
      })
      .finally(() => {
        setInspecting(false);
        idle();
      });
  }, [pulse, idle]);

  const handleSplit = async () => {
    if (!file) {
      toast.error("Upload a PDF first");
      return;
    }

    const options: {
      mode: "range" | "each";
      startPage?: number;
      endPage?: number;
    } = {
      mode: splitEachPage ? "each" : "range",
    };

    if (!splitEachPage) {
      const start = parseInt(startPage, 10);
      const end = endPage.trim() ? parseInt(endPage, 10) : undefined;
      const max = pageCount ?? undefined;
      if (!Number.isFinite(start) || start < 1) {
        toast.error("Enter a valid start page");
        return;
      }
      if (max != null && start > max) {
        toast.error(`Start page must be between 1 and ${max}`);
        return;
      }
      options.startPage = start;
      if (end != null) {
        if (!Number.isFinite(end) || end < start) {
          toast.error("End page must be >= start page");
          return;
        }
        if (max != null && end > max) {
          toast.error(`End page must be between ${start} and ${max}`);
          return;
        }
        options.endPage = end;
      }
    }

    setResult(null);
    try {
      await flowRun(async () => {
        const split = await splitPdfFile(file, options);
        setResult(split);
        toast.success(split.mode === "each" ? "ZIP ready to download" : "PDF ready to download");
      }, "Splitting PDF…");
    } catch (err) {
      toast.error(err instanceof ApiError || err instanceof Error ? err.message : "Split failed");
    }
  };

  const clearAll = () => {
    setFile(null);
    setResult(null);
    setStartPage("1");
    setEndPage("");
    setPageCount(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className={cn(glassCard, "border-border/60 h-fit")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scissors className="h-5 w-5 text-amber-400" />
            Split
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="rounded-lg border border-border/50 px-3 py-2 text-sm">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatBytes(file.size)}
                {inspecting ? " · reading pages…" : pageCount != null ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No file selected</p>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2">
            <div>
              <Label htmlFor="split-each" className="text-sm">
                Every page as file
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Downloads a ZIP (max 150 pages)
              </p>
            </div>
            <Switch
              id="split-each"
              checked={splitEachPage}
              onCheckedChange={(checked) => {
                setSplitEachPage(checked);
                setResult(null);
              }}
            />
          </div>

          {!splitEachPage ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-page">Start page</Label>
                <Input
                  id="start-page"
                  type="number"
                  min={1}
                  max={pageCount ?? undefined}
                  value={startPage}
                  onChange={(e) => {
                    setStartPage(e.target.value);
                    setResult(null);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-page">End page (optional)</Label>
                <Input
                  id="end-page"
                  type="number"
                  min={1}
                  max={pageCount ?? undefined}
                  placeholder={pageCount != null ? String(pageCount) : "Last page"}
                  value={endPage}
                  onChange={(e) => {
                    setEndPage(e.target.value);
                    setResult(null);
                  }}
                />
              </div>
            </div>
          ) : null}

          <Button
            className="w-full"
            onClick={() => void handleSplit()}
            disabled={!file || splitting || inspecting || pageCount == null}
          >
            {splitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Scissors className="h-4 w-4 mr-2" />
            )}
            Split PDF
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
            "rounded-xl border border-dashed border-border/80 p-10 text-center",
            "hover:border-amber-500/40 transition-colors",
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
          <FileText className="h-10 w-10 mx-auto text-amber-400 mb-3" />
          <p className="font-medium">Drop a PDF here</p>
          <p className="text-sm text-muted-foreground mt-1">
            Extract a page range or split every page into separate files
          </p>
        </div>

        {splitting ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              <p className="text-muted-foreground">Splitting PDF…</p>
            </CardContent>
          </Card>
        ) : null}

        {result && !splitting ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Ready
                <Badge variant="secondary">
                  {result.mode === "each" ? "ZIP" : "PDF"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Source pages</p>
                  <p className="font-medium mt-1">{result.pageCount}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Output size</p>
                  <p className="font-medium mt-1">{formatBytes(result.outputBytes)}</p>
                </div>
                {result.mode === "range" ? (
                  <>
                    <div className="rounded-lg border border-border/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">Extracted pages</p>
                      <p className="font-medium mt-1">{result.splitPages}</p>
                    </div>
                    <div className="rounded-lg border border-border/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">Range</p>
                      <p className="font-medium mt-1">
                        {result.startPage} – {result.endPage}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-border/50 px-3 py-2 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Files in ZIP</p>
                    <p className="font-medium mt-1">{result.fileCount}</p>
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={() => downloadResult(result)}>
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
