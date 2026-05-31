"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { lookupWhois } from "@/lib/whois-lookup-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function WhoisLookupTool() {
  const [domain, setDomain] = useState("google.com");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const { run: flowRun, busy } = useWorkflowRunner();

  const run = async () => {
    try {
      await flowRun(async () => {
        setResult(await lookupWhois(domain));
        toast.success("WHOIS loaded");
      }, "Looking up domain…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <Card className={cn(glassCard, "border-border/60 max-w-3xl mx-auto")}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-amber-400" />WHOIS</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
          <Button disabled={busy} onClick={() => void run()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}</Button>
        </div>
        {result ? <pre className="text-xs p-4 rounded-lg border border-border/50 bg-black/30 overflow-auto max-h-[420px]">{JSON.stringify(result, null, 2)}</pre> : null}
      </CardContent>
    </Card>
  );
}
