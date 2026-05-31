"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { lookupIp } from "@/lib/ip-lookup-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function IpLookupTool() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const { run: flowRun, busy } = useWorkflowRunner();

  const run = async (useMine?: boolean) => {
    try {
      await flowRun(async () => {
        setResult(await lookupIp(useMine ? undefined : ip || undefined));
        toast.success("IP resolved");
      }, "Resolving IP…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <Card className={cn(glassCard, "border-border/60 max-w-3xl mx-auto")}>
      <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-cyan-400" />IP Lookup</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="8.8.8.8 (leave empty for your IP)" />
        <div className="flex gap-2">
          <Button disabled={busy} onClick={() => void run()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup IP"}</Button>
          <Button variant="outline" disabled={busy} onClick={() => void run(true)}>My IP</Button>
        </div>
        {result ? <pre className="text-xs p-4 rounded-lg border border-border/50 bg-black/30 overflow-auto">{JSON.stringify(result, null, 2)}</pre> : null}
      </CardContent>
    </Card>
  );
}
