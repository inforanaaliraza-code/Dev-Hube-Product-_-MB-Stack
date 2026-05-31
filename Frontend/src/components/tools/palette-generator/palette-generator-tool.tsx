"use client";

import { useState } from "react";
import { Copy, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { generatePalette } from "@/lib/palette-generator-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function PaletteGeneratorTool() {
  const [mode, setMode] = useState("complementary");
  const [baseColor, setBaseColor] = useState("#6366F1");
  const [colors, setColors] = useState<string[]>([]);
  const [gradient, setGradient] = useState("");
  const [cssVars, setCssVars] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();

  const run = async () => {
    try {
      await flowRun(async () => {
        const res = await generatePalette({ mode, baseColor, count: 5 });
        setColors(res.colors);
        setGradient(res.gradient);
        setCssVars(res.cssVars);
        toast.success("Palette generated");
      }, "Building palette…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-violet-400" />Palette</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["random", "complementary", "analogous", "triadic", "monochrome"].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Base color</Label>
            <Input className="w-[140px]" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} />
          </div>
          <Button disabled={busy} onClick={() => void run()}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Palette className="h-4 w-4 mr-2" />}
            Generate
          </Button>
        </CardContent>
      </Card>
      {colors.length ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {colors.map((c) => (
              <button key={c} type="button" className="rounded-xl h-24 border border-border/50 relative overflow-hidden" style={{ background: c }} onClick={() => { void navigator.clipboard.writeText(c); toast.success(`Copied ${c}`); }}>
                <span className="absolute bottom-2 left-2 text-xs font-mono bg-black/60 px-2 py-0.5 rounded">{c}</span>
              </button>
            ))}
          </div>
          <div className="h-20 rounded-xl border border-border/50" style={{ background: gradient }} />
          <pre className="text-xs p-4 rounded-lg border border-border/50 bg-black/30 overflow-auto">{cssVars}</pre>
          <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(cssVars); toast.success("CSS copied"); }}><Copy className="h-4 w-4 mr-2" />Copy CSS variables</Button>
        </>
      ) : null}
    </div>
  );
}
