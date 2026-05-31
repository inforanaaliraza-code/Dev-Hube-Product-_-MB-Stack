"use client";

import { useState } from "react";
import { Gauge, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { runSpeedTest } from "@/lib/speed-test-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function SpeedTestTool() {
  const [url, setUrl] = useState("https://example.com");
  const [result, setResult] = useState<Awaited<ReturnType<typeof runSpeedTest>> | null>(null);
  const { run: flowRun, busy } = useWorkflowRunner();

  const run = async () => {
    setResult(null);
    try {
      await flowRun(async () => {
        setResult(await runSpeedTest(url));
        toast.success("Speed test done");
      }, "Measuring performance…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <Card className={cn(glassCard, "border-border/60 max-w-3xl mx-auto")}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5 text-emerald-400" />Website Speed Test</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com" />
          <Button disabled={busy} onClick={() => void run()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}</Button>
        </div>
        {result ? (
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg border border-border/50 p-3">Total time<p className="font-semibold mt-1">{result.totalMs} ms</p></div>
            <div className="rounded-lg border border-border/50 p-3">Rating<Badge className="mt-1">{result.rating}</Badge></div>
            <div className="rounded-lg border border-border/50 p-3">Status<p className="font-semibold mt-1">{result.statusCode}</p></div>
            <div className="rounded-lg border border-border/50 p-3">Size<p className="font-semibold mt-1">{(result.downloadBytes / 1024).toFixed(1)} KB</p></div>
            <div className="rounded-lg border border-border/50 p-3 sm:col-span-2">Throughput<p className="font-semibold mt-1">{result.throughputKbps} Kbps</p></div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
