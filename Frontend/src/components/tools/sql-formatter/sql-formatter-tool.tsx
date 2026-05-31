"use client";

import { useState } from "react";
import { Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { formatSql } from "@/lib/sql-formatter-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function SqlFormatterTool() {
  const [sql, setSql] = useState("SELECT id, name FROM users WHERE active = 1 ORDER BY created_at DESC;");
  const [formatted, setFormatted] = useState("");
  const [dialect, setDialect] = useState("sql");
  const { run: flowRun, busy } = useWorkflowRunner();

  const run = async () => {
    try {
      await flowRun(async () => {
        const res = await formatSql(sql, dialect);
        setFormatted(res.formatted);
        toast.success("SQL formatted");
      }, "Formatting SQL…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-cyan-400" />Input</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Dialect</Label>
            <Select value={dialect} onValueChange={setDialect}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["sql", "postgresql", "mysql", "sqlite", "transactsql", "plsql"].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea rows={14} value={sql} onChange={(e) => setSql(e.target.value)} className="font-mono text-sm" />
          <Button className="w-full" disabled={busy} onClick={() => void run()}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
            Format SQL
          </Button>
        </CardContent>
      </Card>
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader><CardTitle>Formatted</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={14} readOnly value={formatted} className="font-mono text-sm" placeholder="Formatted SQL..." />
        </CardContent>
      </Card>
    </div>
  );
}
