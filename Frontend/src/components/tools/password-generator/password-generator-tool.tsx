"use client";

import { useState } from "react";
import { Copy, Loader2, Lock, RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { checkPasswordBreach, generatePassword } from "@/lib/password-generator-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function PasswordGeneratorTool() {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [checkValue, setCheckValue] = useState("");
  const [breach, setBreach] = useState<{ breached: boolean; breachCount: number } | null>(null);
  const { run: flowRun, busy } = useWorkflowRunner();

  const gen = async () => {
    try {
      await flowRun(async () => {
        const res = await generatePassword({ length, uppercase: upper, lowercase: lower, numbers, symbols });
        setPassword(res.password);
        setStrength(res.strength);
        toast.success("Password generated");
      }, "Generating password…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  const check = async () => {
    if (!checkValue) return toast.error("Enter a password to check");
    try {
      await flowRun(async () => {
        const res = await checkPasswordBreach(checkValue);
        setBreach({ breached: res.breached, breachCount: res.breachCount });
        setStrength(res.strength);
        toast.success("Breach check complete");
      }, "Checking breaches…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-emerald-400" />Generate</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Length: {length}</Label>
            <Slider min={8} max={64} step={1} value={[length]} onValueChange={(v) => setLength(v[0] ?? 16)} />
          </div>
          {[{ label: "Uppercase", v: upper, s: setUpper }, { label: "Lowercase", v: lower, s: setLower }, { label: "Numbers", v: numbers, s: setNumbers }, { label: "Symbols", v: symbols, s: setSymbols }].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <Label>{row.label}</Label>
              <Switch checked={row.v} onCheckedChange={row.s} />
            </div>
          ))}
          <Button className="w-full" disabled={busy} onClick={() => void gen()}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Generate
          </Button>
          <div className="flex gap-2">
            <Input readOnly value={password} className="font-mono" />
            {password ? <Button variant="outline" size="icon" onClick={() => { void navigator.clipboard.writeText(password); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button> : null}
          </div>
          {strength ? <Badge variant="secondary">Strength: {strength}</Badge> : null}
        </CardContent>
      </Card>
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-cyan-400" />Breach check</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" value={checkValue} onChange={(e) => setCheckValue(e.target.value)} placeholder="Password to check (HIBP)" />
          <Button className="w-full" variant="secondary" disabled={busy} onClick={() => void check()}>Check breach</Button>
          {breach ? (
            <p className={cn("text-sm", breach.breached ? "text-red-400" : "text-emerald-400")}>
              {breach.breached ? `Found in ${breach.breachCount} breaches` : "Not found in known breaches"}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
