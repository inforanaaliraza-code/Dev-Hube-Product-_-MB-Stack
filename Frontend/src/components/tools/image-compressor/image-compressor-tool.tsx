"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  ImageIcon,
  Loader2,
  Minimize2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  compressImageFile,
  getWorkerHealth,
  type CompressImageResult,
  type OutputFormat,
} from "@/lib/image-compressor-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_FILE_BYTES = 15 * 1024 * 1024;

type JobStatus = "pending" | "compressing" | "done" | "error";

type CompressionJob = {
  id: string;
  file: File;
  status: JobStatus;
  error?: string;
  result?: CompressImageResult;
  previewUrl?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileToDataUrl(base64: string, mime: string) {
  return `data:${mime};base64,${base64}`;
}

function downloadResult(job: CompressionJob) {
  if (!job.result) return;
  const ext = job.result.outputFormat === "jpeg" ? "jpg" : job.result.outputFormat;
  const base = job.file.name.replace(/\.[^.]+$/, "");
  const link = document.createElement("a");
  link.href = fileToDataUrl(job.result.fileBase64, job.result.mimeType);
  link.download = `${base}-compressed.${ext}`;
  link.click();
}

function createJobId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ImageCompressorTool() {
  const [jobs, setJobs] = useState<CompressionJob[]>([]);
  const [quality, setQuality] = useState(82);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [resizeEnabled, setResizeEnabled] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("auto");
  const [stripMetadata, setStripMetadata] = useState(true);
  const { healthy: workerHealthy } = useWorkerHealth(getWorkerHealth);
  const { run: flowRun, busy: compressingAll } = useWorkflowRunner("file");
  const inputRef = useRef<HTMLInputElement>(null);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    const valid: CompressionJob[] = [];
    for (const file of list) {
      if (!ACCEPT.split(",").includes(file.type)) {
        toast.error(`${file.name}: only PNG, JPG and WebP`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name}: exceeds 15 MB`);
        continue;
      }
      valid.push({
        id: createJobId(),
        file,
        status: "pending",
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (valid.length) {
      setJobs((prev) => [...prev, ...valid]);
    }
  }, []);

  const updateJob = useCallback((id: string, patch: Partial<CompressionJob>) => {
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...patch } : job)));
  }, []);

  const compressOne = useCallback(
    async (job: CompressionJob) => {
      updateJob(job.id, { status: "compressing", error: undefined });
      try {
        const result = await compressImageFile(job.file, {
          quality,
          maxWidth: resizeEnabled ? maxWidth : undefined,
          outputFormat,
          stripMetadata,
        });
        updateJob(job.id, { status: "done", result });
      } catch (err) {
        const message =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Compression failed";
        updateJob(job.id, { status: "error", error: message });
      }
    },
    [maxWidth, outputFormat, quality, resizeEnabled, stripMetadata, updateJob],
  );

  const compressAll = useCallback(async () => {
    const pending = jobsRef.current.filter((j) => j.status === "pending" || j.status === "error");
    if (!pending.length) {
      toast.message("Add images to compress");
      return;
    }
    try {
      await flowRun(async () => {
        for (const job of pending) {
          await compressOne(job);
        }
        toast.success("Compression finished");
      }, "Compressing images…");
    } catch {
      toast.error("Compression failed");
    }
  }, [compressOne]);

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => {
      const target = prev.find((j) => j.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((j) => j.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    jobsRef.current.forEach((job) => {
      if (job.previewUrl) {
        URL.revokeObjectURL(job.previewUrl);
      }
    });
    setJobs([]);
  }, []);

  useEffect(() => {
    return () => {
      jobsRef.current.forEach((job) => {
        if (job.previewUrl) {
          URL.revokeObjectURL(job.previewUrl);
        }
      });
    };
  }, []);

  const doneCount = jobs.filter((j) => j.status === "done").length;
  const totalSaved = jobs.reduce((sum, job) => {
    if (!job.result) return sum;
    return sum + (job.result.originalBytes - job.result.compressedBytes);
  }, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className={cn(glassCard, "border-border/60 h-fit")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Minimize2 className="h-5 w-5 text-violet-400" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Quality ({quality}%)</Label>
            <Slider
              min={40}
              max={100}
              step={1}
              value={[quality]}
              onValueChange={(v) => setQuality(v[0] ?? 82)}
            />
            <p className="text-xs text-muted-foreground">
              Lower values shrink file size more; higher keeps more detail.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Max width</Label>
              <Switch checked={resizeEnabled} onCheckedChange={setResizeEnabled} />
            </div>
            <Slider
              min={640}
              max={4096}
              step={64}
              disabled={!resizeEnabled}
              value={[maxWidth]}
              onValueChange={(v) => setMaxWidth(v[0] ?? 1920)}
            />
          </div>

          <div className="space-y-2">
            <Label>Output format</Label>
            <Select
              value={outputFormat}
              onValueChange={(v) => setOutputFormat(v as OutputFormat)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (match input)</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <Label htmlFor="strip-meta" className="text-sm cursor-pointer">
              Strip metadata
            </Label>
            <Switch
              id="strip-meta"
              checked={stripMetadata}
              onCheckedChange={setStripMetadata}
            />
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
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
            Upload images
          </Button>

          <Button
            className="w-full"
            variant="secondary"
            onClick={() => void compressAll()}
            disabled={compressingAll || !jobs.length}
          >
            {compressingAll ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Minimize2 className="h-4 w-4 mr-2" />
            )}
            Compress all
          </Button>

          <WorkerStatusHint healthy={workerHealthy} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div
          className={cn(
            glassCard,
            "rounded-xl border border-dashed border-border/80 p-10 text-center transition-colors",
            "hover:border-violet-500/50",
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
          <ImageIcon className="h-10 w-10 mx-auto text-violet-400 mb-3" />
          <p className="font-medium">Drop PNG, JPG or WebP here</p>
          <p className="text-sm text-muted-foreground mt-1">Up to 15 MB per file</p>
          {doneCount > 0 ? (
            <p className="text-xs text-emerald-500 mt-3">
              {doneCount} compressed · saved {formatBytes(Math.max(0, totalSaved))}
            </p>
          ) : null}
        </div>

        {jobs.length ? (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} className={cn(glassCard, "border-border/60 overflow-hidden")}>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 gap-0 border-b border-border/50">
                  <div className="p-3 border-r border-border/50">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Original
                    </p>
                    {job.previewUrl ? (
                      <img
                        src={job.previewUrl}
                        alt={job.file.name}
                        className="w-full h-28 object-contain rounded-md bg-black/20"
                      />
                    ) : null}
                    <p className="text-xs mt-2 truncate">{job.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(job.file.size)}
                    </p>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Compressed
                    </p>
                    {job.status === "done" && job.result ? (
                      <>
                        <img
                          src={fileToDataUrl(job.result.fileBase64, job.result.mimeType)}
                          alt="Compressed"
                          className="w-full h-28 object-contain rounded-md bg-black/20"
                        />
                        <p className="text-xs mt-2 text-emerald-500">
                          {formatBytes(job.result.compressedBytes)} · −
                          {job.result.savingsPercent}%
                        </p>
                      </>
                    ) : job.status === "compressing" ? (
                      <div className="h-28 grid place-items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : job.status === "error" ? (
                      <p className="text-xs text-destructive mt-4">{job.error}</p>
                    ) : (
                      <div className="h-28 grid place-items-center text-xs text-muted-foreground">
                        Pending
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2 gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {job.status}
                  </Badge>
                  <div className="flex gap-1">
                    {job.status === "done" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadResult(job)}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                    ) : null}
                    {(job.status === "pending" || job.status === "error") && !compressingAll ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void compressOne(job)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeJob(job.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!jobs.length ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Upload or drop images to start compressing
          </p>
        ) : null}
      </div>
    </div>
  );
}
