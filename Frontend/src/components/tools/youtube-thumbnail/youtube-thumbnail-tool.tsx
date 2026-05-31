"use client";

import { useState } from "react";
import { Download, Loader2, Youtube } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { resolveYoutubeThumbnail } from "@/lib/youtube-thumbnail-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function YoutubeThumbnailTool() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof resolveYoutubeThumbnail>> | null>(null);
  const { run: flowRun, busy } = useWorkflowRunner();

  const run = async () => {
    if (!url.trim()) return toast.error("Paste a YouTube URL");
    setData(null);
    try {
      await flowRun(async () => {
        setData(await resolveYoutubeThumbnail(url.trim()));
        toast.success("Thumbnails loaded");
      }, "Fetching thumbnails…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  const entries = data ? Object.entries(data.thumbnails) : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Youtube className="h-5 w-5 text-fuchsia-400" />YouTube URL</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          <Button disabled={busy} onClick={() => void run()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get"}
          </Button>
        </CardContent>
      </Card>
      {data ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map(([label, src]) => (
            <Card key={label} className={cn(glassCard, "border-border/60 overflow-hidden")}>
              <CardHeader className="pb-2"><CardTitle className="text-sm capitalize">{label}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <img src={src} alt={label} className="w-full rounded-lg border border-border/50" />
                <Button variant="outline" className="w-full" asChild>
                  <a href={src} download={`${data.videoId}-${label}.jpg`} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
