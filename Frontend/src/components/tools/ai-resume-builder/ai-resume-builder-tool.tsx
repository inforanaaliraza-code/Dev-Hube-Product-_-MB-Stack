"use client";

import { useState } from "react";
import { Download, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { generateResume, getWorkerHealth } from "@/lib/ai-resume-builder-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function AiResumeBuilderTool() {
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [resume, setResume] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner("ai");
  const { healthy } = useWorkerHealth(getWorkerHealth);

  const run = async () => {
    if (!fullName.trim() || !jobTitle.trim()) return toast.error("Name and job title required");
    try {
      await flowRun(async () => {
        const res = await generateResume({ fullName, jobTitle, summary, experience, skills, education });
        setResume(res.resumeMarkdown);
        toast.success("Resume generated");
      }, "Building resume…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-amber-400" />Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div><Label>Job title</Label><Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></div>
          <div><Label>Summary</Label><Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} /></div>
          <div><Label>Experience</Label><Textarea rows={4} value={experience} onChange={(e) => setExperience(e.target.value)} /></div>
          <div><Label>Skills</Label><Textarea rows={2} value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
          <div><Label>Education</Label><Textarea rows={2} value={education} onChange={(e) => setEducation(e.target.value)} /></div>
          <Button className="w-full" disabled={busy} onClick={() => void run()}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserRound className="h-4 w-4 mr-2" />}
            Build resume
          </Button>
          <WorkerStatusHint healthy={healthy} />
        </CardContent>
      </Card>
      <Card className={cn(glassCard, "border-border/60")}>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Preview</CardTitle>
          {resume ? (
            <Button size="sm" variant="outline" onClick={() => {
              const blob = new Blob([resume], { type: "text/markdown" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `${fullName || "resume"}.md`;
              a.click();
            }}><Download className="h-4 w-4" /></Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <pre className="text-sm whitespace-pre-wrap max-h-[520px] overflow-auto p-4 rounded-lg border border-border/50 bg-black/30">{resume || "Resume markdown appears here"}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
