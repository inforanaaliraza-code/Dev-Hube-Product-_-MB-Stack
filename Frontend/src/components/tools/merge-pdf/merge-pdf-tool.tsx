"use client";

import { useCallback, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  FileStack,
  GripVertical,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  getWorkerHealth,
  mergePdfFiles,
  type MergePdfResult,
} from "@/lib/merge-pdf-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 20;
type PdfItem = {
  id: string;
  file: File;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function downloadPdf(result: MergePdfResult) {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${result.pdfBase64}`;
  link.download = result.filename;
  link.click();
}

export function MergePdfTool() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [result, setResult] = useState<MergePdfResult | null>(null);
  const { run: flowRun, busy: merging } = useWorkflowRunner("file");
  const { healthy: workerHealthy } = useWorkerHealth(getWorkerHealth);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalInputBytes = items.reduce((sum, item) => sum + item.file.size, 0);

  const addFiles = useCallback((list: FileList | File[]) => {
    const incoming = Array.from(list);
    const valid: PdfItem[] = [];
    for (const file of incoming) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error(`${file.name}: only PDF files`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name}: exceeds 25 MB`);
        continue;
      }
      valid.push({ id: createId(), file });
    }
    if (!valid.length) return;
    setItems((prev) => {
      const next = [...prev, ...valid];
      if (next.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files`);
        return prev;
      }
      return next;
    });
    setResult(null);
  }, []);

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index]!;
      next[index] = next[target]!;
      next[target] = tmp;
      return next;
    });
    setResult(null);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setResult(null);
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      toast.error("Add at least two PDF files");
      return;
    }
    setResult(null);
    try {
      await flowRun(async () => {
        const merged = await mergePdfFiles(items.map((item) => item.file));
        setResult(merged);
        toast.success("PDFs merged successfully");
      }, "Merging PDFs…");
    } catch (err) {
      toast.error(err instanceof ApiError || err instanceof Error ? err.message : "Merge failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className={cn(glassCard, "border-border/60 h-fit")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileStack className="h-5 w-5 text-fuchsia-400" />
            Merge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                addFiles(e.target.files);
              }
              e.target.value = "";
            }}
          />

          <Button className="w-full" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Add PDF files
          </Button>

          <p className="text-xs text-muted-foreground">
            {items.length} file{items.length === 1 ? "" : "s"} · {formatBytes(totalInputBytes)} ·
            max {MAX_FILES} files
          </p>

          <Button
            className="w-full"
            onClick={() => void handleMerge()}
            disabled={items.length < 2 || merging}
          >
            {merging ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileStack className="h-4 w-4 mr-2" />
            )}
            Merge PDFs
          </Button>

          {items.length > 0 ? (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setItems([]);
                setResult(null);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
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
            "hover:border-fuchsia-500/40 transition-colors",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) {
              addFiles(e.dataTransfer.files);
            }
          }}
        >
          <FileStack className="h-10 w-10 mx-auto text-fuchsia-400 mb-3" />
          <p className="font-medium">Drop PDF files here</p>
          <p className="text-sm text-muted-foreground mt-1">
            Order matters — use arrows to reorder before merging
          </p>
        </div>

        {items.length ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">File order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(item.file.size)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {merging ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-fuchsia-400" />
              <p className="text-muted-foreground">Merging PDFs…</p>
            </CardContent>
          </Card>
        ) : null}

        {result && !merging ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Merged PDF ready</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Files merged</p>
                  <p className="font-medium mt-1">{result.fileCount}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Total pages</p>
                  <p className="font-medium mt-1">{result.totalPages}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Input size</p>
                  <p className="font-medium mt-1">{formatBytes(result.inputBytes)}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Output size</p>
                  <p className="font-medium mt-1">{formatBytes(result.totalBytes)}</p>
                </div>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {result.sources.map((source) => (
                  <li key={source.name}>
                    {source.name} — {source.pages} page{source.pages === 1 ? "" : "s"}
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => downloadPdf(result)}>
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
