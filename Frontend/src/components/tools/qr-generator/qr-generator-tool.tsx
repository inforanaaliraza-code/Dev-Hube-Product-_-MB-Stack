"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Copy,
  Download,
  ImagePlus,
  Link2,
  Loader2,
  QrCode,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  createQrCode,
  deleteQrCode,
  fetchQrAnalytics,
  fetchQrCode,
  getStoredQrId,
  getWorkerHealth,
  regenerateQrImage,
  setStoredQrId,
  updateQrCode,
  type CreateQrCodeInput,
  type QrAnalytics,
  type QrCodeRecord,
  type QrCodeMode,
  type QrContentType,
  type QrErrorLevel,
} from "@/lib/qr-generator-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const ANALYTICS_POLL_MS = 12000;
const WORKER_HEALTH_MS = 60000;
const MAX_LOGO_BYTES = 512_000;

function pngDataUrl(base64: string) {
  return `data:image/png;base64,${base64}`;
}

function downloadBase64Png(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = pngDataUrl(base64);
  link.download = filename;
  link.click();
}

async function readLogoFile(file: File): Promise<string> {
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Logo must be under 512 KB");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read logo"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Could not read logo"));
    reader.readAsDataURL(file);
  });
}

export function QrGeneratorTool() {
  const [mode, setMode] = useState<QrCodeMode>("static");
  const [contentType, setContentType] = useState<QrContentType>("url");
  const [payload, setPayload] = useState("https://");
  const [trackScans, setTrackScans] = useState(false);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [errorCorrection, setErrorCorrection] = useState<QrErrorLevel>("H");
  const [sizePx, setSizePx] = useState(512);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.22);
  const [record, setRecord] = useState<QrCodeRecord | null>(null);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<QrAnalytics | null>(null);
  const [workerHealthy, setWorkerHealthy] = useState<boolean | null>(null);
  const [booting, setBooting] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingTarget, setSavingTarget] = useState(false);
  const [refreshingAnalytics, setRefreshingAnalytics] = useState(false);
  const [dynamicTarget, setDynamicTarget] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyticsPollRef = useRef(false);

  const effectiveTrackScans = mode === "dynamic" || trackScans;

  const checkWorkerHealth = useCallback(async () => {
    try {
      const health = await getWorkerHealth();
      setWorkerHealthy(health.ok);
    } catch {
      setWorkerHealthy(false);
    }
  }, []);

  const loadAnalytics = useCallback(async (id: string, silent = false) => {
    if (!silent) {
      setRefreshingAnalytics(true);
    }
    try {
      const data = await fetchQrAnalytics(id);
      setAnalytics(data);
      setRecord((prev) => (prev ? { ...prev, scanCount: data.totalScans } : prev));
    } catch (err) {
      if (!silent) {
        toast.error(err instanceof Error ? err.message : "Could not load analytics");
      }
    } finally {
      if (!silent) {
        setRefreshingAnalytics(false);
      }
    }
  }, []);

  const applyRecord = useCallback(
    (data: QrCodeRecord) => {
      setRecord(data);
      setStoredQrId(data.id);
      if (data.imagePngBase64) {
        setPreviewBase64(data.imagePngBase64);
      }
      setMode(data.mode);
      setContentType(data.contentType);
      setPayload(data.payload);
      setDynamicTarget(data.payload);
      setForegroundColor(data.foregroundColor);
      setBackgroundColor(data.backgroundColor);
      setErrorCorrection(data.errorCorrection as QrErrorLevel);
      setSizePx(data.sizePx);
      setTrackScans(data.trackScans);
      if (data.trackScans) {
        void loadAnalytics(data.id, true);
      } else {
        setAnalytics(null);
      }
    },
    [loadAnalytics],
  );

  const handleGenerate = async () => {
    const trimmed = payload.trim();
    if (!trimmed) {
      toast.error("Enter content for the QR code");
      return;
    }
    setGenerating(true);
    try {
      const input: CreateQrCodeInput = {
        mode,
        contentType,
        payload: trimmed,
        trackScans: mode === "static" ? trackScans : undefined,
        foregroundColor,
        backgroundColor,
        errorCorrection,
        sizePx,
        logoBase64: logoBase64 ?? undefined,
        logoScale,
      };
      const created = await createQrCode(input);
      applyRecord(created);
      toast.success("QR code generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegeneratePreview = async () => {
    if (!record) return;
    setGenerating(true);
    try {
      const refreshed = await regenerateQrImage(record.id);
      applyRecord(refreshed);
      toast.success("Preview refreshed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not refresh preview");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDynamicTarget = async () => {
    if (!record || record.mode !== "dynamic") return;
    const trimmed = dynamicTarget.trim();
    if (!trimmed) {
      toast.error("Enter a destination URL");
      return;
    }
    setSavingTarget(true);
    try {
      const updated = await updateQrCode(record.id, trimmed);
      applyRecord({ ...updated, imagePngBase64: previewBase64 ?? undefined });
      toast.success("Destination URL updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingTarget(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;
    try {
      await deleteQrCode(record.id);
      setStoredQrId(null);
      setRecord(null);
      setPreviewBase64(null);
      setAnalytics(null);
      toast.success("QR code removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleLogoPick = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await readLogoFile(file);
      setLogoBase64(dataUrl);
      setErrorCorrection("H");
      toast.success("Logo added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid logo");
    }
  };

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      await checkWorkerHealth();
      const storedId = getStoredQrId();
      if (storedId) {
        try {
          const existing = await fetchQrCode(storedId);
          if (!cancelled) {
            applyRecord(existing);
            const image = await regenerateQrImage(storedId);
            if (!cancelled) {
              setPreviewBase64(image.imagePngBase64 ?? null);
            }
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            setStoredQrId(null);
          }
        }
      }
      if (!cancelled) {
        setBooting(false);
      }
    };
    void boot();
    const healthTimer = window.setInterval(() => {
      void checkWorkerHealth();
    }, WORKER_HEALTH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(healthTimer);
    };
  }, [applyRecord, checkWorkerHealth]);

  useEffect(() => {
    if (!record?.trackScans) {
      return;
    }
    const timer = window.setInterval(() => {
      if (analyticsPollRef.current) return;
      analyticsPollRef.current = true;
      void loadAnalytics(record.id, true).finally(() => {
        analyticsPollRef.current = false;
      });
    }, ANALYTICS_POLL_MS);
    return () => window.clearInterval(timer);
  }, [record?.id, record?.trackScans, loadAnalytics]);

  useEffect(() => {
    if (mode === "dynamic") {
      setContentType("url");
      setTrackScans(true);
    }
  }, [mode]);

  const previewSrc = previewBase64 ? pngDataUrl(previewBase64) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5 text-amber-400" />
            Configure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as QrCodeMode)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="static">Static</TabsTrigger>
              <TabsTrigger value="dynamic">Dynamic URL</TabsTrigger>
            </TabsList>
            <TabsContent value="static" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Encodes your content directly. Enable scan tracking to use a short redirect link with analytics.
              </p>
            </TabsContent>
            <TabsContent value="dynamic" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                QR always points to a Dev Hube redirect link. Change the destination URL anytime without reprinting the code.
              </p>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Content type</Label>
              <Select
                value={contentType}
                onValueChange={(v) => setContentType(v as QrContentType)}
                disabled={mode === "dynamic"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="text">Plain text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                <Label htmlFor="track-scans" className="text-sm cursor-pointer">
                  Track scans
                </Label>
                <Switch
                  id="track-scans"
                  checked={effectiveTrackScans}
                  onCheckedChange={setTrackScans}
                  disabled={mode === "dynamic"}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{mode === "dynamic" ? "Destination URL" : contentType === "url" ? "URL" : "Text"}</Label>
            {contentType === "text" && mode === "static" ? (
              <Textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={4}
                placeholder="Any text to encode"
              />
            ) : (
              <Input
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="https://example.com"
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Foreground</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="h-10 w-14 p-1 cursor-pointer"
                />
                <Input
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Background</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-10 w-14 p-1 cursor-pointer"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Error correction</Label>
              <Select
                value={errorCorrection}
                onValueChange={(v) => setErrorCorrection(v as QrErrorLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">L — 7%</SelectItem>
                  <SelectItem value="M">M — 15%</SelectItem>
                  <SelectItem value="Q">Q — 25%</SelectItem>
                  <SelectItem value="H">H — 30% (logo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size ({sizePx}px)</Label>
              <Slider
                min={256}
                max={1024}
                step={64}
                value={[sizePx]}
                onValueChange={(v) => setSizePx(v[0] ?? 512)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Center logo (optional)</Label>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  void handleLogoPick(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Upload logo
              </Button>
              {logoBase64 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogoBase64(null)}
                >
                  Remove logo
                </Button>
              ) : null}
            </div>
            {logoBase64 ? (
              <div className="space-y-2">
                <Label>Logo size</Label>
                <Slider
                  min={0.12}
                  max={0.3}
                  step={0.02}
                  value={[logoScale]}
                  onValueChange={(v) => setLogoScale(v[0] ?? 0.22)}
                />
              </div>
            ) : null}
          </div>

          <Button
            className="w-full"
            onClick={() => void handleGenerate()}
            disabled={generating || booting}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate QR code
          </Button>

          {workerHealthy === false ? (
            <p className="text-xs text-amber-500">
              Python worker offline — using Node fallback (logo overlay may be limited).
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className={cn(glassCard, "border-border/60")}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Preview</CardTitle>
            {record ? (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleRegeneratePreview()}
                  disabled={generating}
                  title="Refresh preview"
                >
                  <RefreshCw className={cn("h-4 w-4", generating && "animate-spin")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete()}
                  title="Delete saved QR"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {booting ? (
              <div className="py-16 text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading…
              </div>
            ) : previewSrc ? (
              <>
                <div className="rounded-2xl bg-white p-4 shadow-inner">
                  <img
                    src={previewSrc}
                    alt="Generated QR code"
                    width={sizePx}
                    height={sizePx}
                    className="max-w-full h-auto"
                    style={{ maxWidth: 280 }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-center w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (!previewBase64) return;
                      downloadBase64Png(previewBase64, `qr-${record?.shortCode ?? record?.id ?? "code"}.png`);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                  {record?.redirectUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(record.redirectUrl!);
                        toast.success("Redirect link copied");
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy redirect URL
                    </Button>
                  ) : null}
                </div>
                {record?.redirectUrl ? (
                  <p className="text-xs text-muted-foreground text-center break-all">
                    <Link2 className="inline h-3 w-3 mr-1" />
                    {record.redirectUrl}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="py-16 text-center text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Generate a QR code to see the preview</p>
              </div>
            )}
          </CardContent>
        </Card>

        {record?.mode === "dynamic" ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Update destination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={dynamicTarget}
                onChange={(e) => setDynamicTarget(e.target.value)}
                placeholder="https://new-destination.com"
              />
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => void handleSaveDynamicTarget()}
                disabled={savingTarget}
              >
                {savingTarget ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save destination URL
              </Button>
              <p className="text-xs text-muted-foreground">
                The printed QR image stays the same; scans will follow this URL.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {record?.trackScans ? (
          <Card className={cn(glassCard, "border-border/60")}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-400" />
                Scan analytics
              </CardTitle>
              <Badge variant="secondary">{record.scanCount} scans</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => record && void loadAnalytics(record.id)}
                  disabled={refreshingAnalytics}
                >
                  <RefreshCw
                    className={cn("h-4 w-4 mr-2", refreshingAnalytics && "animate-spin")}
                  />
                  Refresh
                </Button>
              </div>
              <ScrollArea className="h-[220px] pr-3">
                {analytics?.scans.length ? (
                  <ul className="space-y-3">
                    {analytics.scans.map((scan) => (
                      <li
                        key={scan.id}
                        className="rounded-lg border border-border/50 px-3 py-2 text-sm"
                      >
                        <p className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(scan.scannedAt), {
                            addSuffix: true,
                          })}
                        </p>
                        <p className="mt-1 truncate font-mono text-xs">
                          {scan.userAgent ?? "Unknown device"}
                        </p>
                        {scan.referer ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {scan.referer}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No scans yet. Open the redirect link or scan the QR to test.
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
