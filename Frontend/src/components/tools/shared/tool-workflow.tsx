"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  Bot,
  Check,
  Circle,
  CloudUpload,
  Cpu,
  Download,
  Loader2,
  Send,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowVariant = "api" | "file" | "ai" | "stream";
export type WorkflowPhase = "idle" | "input" | "process" | "output" | "done" | "error";

type StepDef = { id: string; label: string; sub: string; icon: typeof Send };

const STEPS: Record<WorkflowVariant, StepDef[]> = {
  api: [
    { id: "input", label: "Capture", sub: "Payload ready", icon: Send },
    { id: "process", label: "Engine", sub: "API orchestration", icon: Cpu },
    { id: "output", label: "Deliver", sub: "Structured result", icon: Sparkles },
  ],
  file: [
    { id: "input", label: "Ingest", sub: "Binary secured", icon: CloudUpload },
    { id: "process", label: "Transform", sub: "Worker pipeline", icon: Cpu },
    { id: "output", label: "Export", sub: "Asset ready", icon: Download },
  ],
  ai: [
    { id: "input", label: "Intent", sub: "Prompt locked", icon: Send },
    { id: "process", label: "Inference", sub: "Model runtime", icon: Bot },
    { id: "output", label: "Synthesize", sub: "Response stream", icon: Sparkles },
  ],
  stream: [
    { id: "input", label: "Listen", sub: "Channel open", icon: Circle },
    { id: "process", label: "Sync", sub: "Live automation", icon: Activity },
    { id: "output", label: "Signal", sub: "Real-time feed", icon: Zap },
  ],
};

const AUTOMATION_SCRIPT: Record<WorkflowVariant, Array<{ at: number; log: string; progress: number }>> = {
  api: [
    { at: 0, log: "[sys] Automation pipeline initialized", progress: 8 },
    { at: 280, log: "[validate] Normalizing request envelope", progress: 22 },
    { at: 620, log: "[route] Nest gateway → service module", progress: 38 },
    { at: 980, log: "[exec] Running server-side transform", progress: 58 },
    { at: 1400, log: "[sync] Awaiting response buffer", progress: 74 },
  ],
  file: [
    { at: 0, log: "[sys] Secure upload channel opened", progress: 10 },
    { at: 320, log: "[scan] MIME & size policy check", progress: 26 },
    { at: 700, log: "[route] Handoff to Python worker", progress: 44 },
    { at: 1100, log: "[proc] Heavy transform in progress", progress: 62 },
    { at: 1600, log: "[pack] Encoding output artifact", progress: 78 },
  ],
  ai: [
    { at: 0, log: "[sys] AI runtime session started", progress: 12 },
    { at: 350, log: "[token] Context window prepared", progress: 28 },
    { at: 750, log: "[infer] Model forward pass", progress: 48 },
    { at: 1200, log: "[stream] Synthesizing completion", progress: 68 },
    { at: 1700, log: "[guard] Safety & format pass", progress: 82 },
  ],
  stream: [
    { at: 0, log: "[sys] Live listener attached", progress: 15 },
    { at: 400, log: "[poll] Inbox synchronization", progress: 35 },
    { at: 900, log: "[parse] Signal extraction", progress: 55 },
    { at: 1400, log: "[emit] Pushing to UI layer", progress: 72 },
  ],
};

type Ctx = {
  phase: WorkflowPhase;
  variant: WorkflowVariant;
  message: string;
  progress: number;
  logs: string[];
  setVariant: (v: WorkflowVariant) => void;
  setPhase: (p: WorkflowPhase) => void;
  setMessage: (m: string) => void;
  setProgress: (n: number) => void;
  pushLog: (line: string) => void;
  resetTrace: () => void;
};

const ToolWorkflowContext = createContext<Ctx | null>(null);

export function ToolWorkflowProvider({
  children,
  defaultVariant = "api",
}: {
  children: ReactNode;
  defaultVariant?: WorkflowVariant;
}) {
  const [phase, setPhase] = useState<WorkflowPhase>("idle");
  const [variant, setVariant] = useState<WorkflowVariant>(defaultVariant);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const pushLog = useCallback((line: string) => {
    setLogs((prev) => [...prev.slice(-7), line]);
  }, []);

  const resetTrace = useCallback(() => {
    setLogs([]);
    setProgress(0);
  }, []);

  const value = useMemo(
    () => ({
      phase,
      variant,
      message,
      progress,
      logs,
      setVariant,
      setPhase,
      setMessage,
      setProgress,
      pushLog,
      resetTrace,
    }),
    [phase, variant, message, progress, logs, pushLog, resetTrace],
  );

  return <ToolWorkflowContext.Provider value={value}>{children}</ToolWorkflowContext.Provider>;
}

function useCtx() {
  const ctx = useContext(ToolWorkflowContext);
  if (!ctx) throw new Error("ToolWorkflowProvider required");
  return ctx;
}

function scheduleAutomation(ctx: Ctx, v: WorkflowVariant) {
  const timers: number[] = [];
  const script = AUTOMATION_SCRIPT[v];
  for (const step of script) {
    timers.push(
      window.setTimeout(() => {
        ctx.pushLog(step.log);
        ctx.setProgress(step.progress);
      }, step.at),
    );
  }
  return timers;
}

export function useWorkflowRunner(variant?: WorkflowVariant) {
  const ctx = useCtx();
  const timersRef = useRef<number[]>([]);
  const busy = ctx.phase === "process" || ctx.phase === "input";

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, processMessage = "Automation running…"): Promise<T> => {
      const v = variant ?? ctx.variant;
      if (variant) ctx.setVariant(variant);
      clearTimers();
      ctx.resetTrace();
      ctx.setMessage(processMessage);
      ctx.setPhase("input");
      ctx.pushLog("[sys] Input stage engaged");
      ctx.setProgress(4);
      await new Promise((r) => window.setTimeout(r, 320));
      ctx.setPhase("process");
      ctx.pushLog("[sys] Orchestrator active");
      timersRef.current = scheduleAutomation(ctx, v);
      try {
        const result = await fn();
        clearTimers();
        ctx.setProgress(100);
        ctx.pushLog("[done] Pipeline completed successfully");
        ctx.setMessage("Automation complete");
        ctx.setPhase("done");
        window.setTimeout(() => {
          ctx.setPhase("idle");
          ctx.setMessage("");
          ctx.resetTrace();
        }, 2600);
        return result;
      } catch (e) {
        clearTimers();
        ctx.setProgress(ctx.progress || 40);
        ctx.pushLog("[error] Pipeline halted — check input or worker");
        ctx.setMessage("Automation failed");
        ctx.setPhase("error");
        window.setTimeout(() => {
          ctx.setPhase("idle");
          ctx.setMessage("");
          ctx.resetTrace();
        }, 3000);
        throw e;
      }
    },
    [ctx, variant, clearTimers],
  );

  const pulse = useCallback(
    (processMessage?: string) => {
      if (variant) ctx.setVariant(variant);
      clearTimers();
      ctx.resetTrace();
      ctx.setMessage(processMessage ?? "Live automation…");
      ctx.setPhase("process");
      ctx.pushLog("[sys] Continuous sync mode");
      timersRef.current = scheduleAutomation(ctx, variant ?? ctx.variant);
    },
    [ctx, variant, clearTimers],
  );

  const idle = useCallback(() => {
    clearTimers();
    ctx.setPhase("idle");
    ctx.setMessage("");
    ctx.resetTrace();
  }, [ctx, clearTimers]);

  return { run, pulse, idle, busy, phase: ctx.phase, progress: ctx.progress };
}

function stepIndex(phase: WorkflowPhase) {
  if (phase === "idle") return -1;
  if (phase === "input") return 0;
  if (phase === "process") return 1;
  if (phase === "done" || phase === "output") return 2;
  if (phase === "error") return 1;
  return -1;
}

function WorkflowParticles() {
  return (
    <div className="tool-workflow-particles absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="tool-workflow-particle"
          style={{
            left: `${10 + ((i * 17) % 80)}%`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function AutomationConsole() {
  const { phase, logs, progress, message } = useCtx();
  const active = phase === "process" || phase === "input" || phase === "done";
  if (!active && logs.length === 0) {
    return (
      <div className="tool-workflow-console tool-workflow-console--idle rounded-xl border border-border/40 p-3 min-h-[88px]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Automation trace</p>
        <p className="text-xs text-muted-foreground mt-2 font-mono">Awaiting task…</p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "tool-workflow-console rounded-xl border p-3 min-h-[88px]",
        phase === "error" && "tool-workflow-console--error",
        phase === "done" && "tool-workflow-console--done",
        (phase === "process" || phase === "input") && "tool-workflow-console--live",
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Live trace</p>
        <span className="text-[10px] font-mono tabular-nums text-primary">{progress}%</span>
      </div>
      <div className="space-y-1 max-h-[72px] overflow-hidden">
        {logs.map((line, idx) => (
          <p
            key={`${line}-${idx}`}
            className="tool-workflow-log-line text-[11px] font-mono text-emerald-400/90 truncate"
          >
            {line}
          </p>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2 truncate">{message}</p>
    </div>
  );
}

export function ToolWorkflowRail() {
  const { phase, variant, message, progress } = useCtx();
  const steps = STEPS[variant];
  const active = stepIndex(phase);
  const flowing = phase === "process" || phase === "input";
  const statusLabel =
    phase === "done" ? "COMPLETED" : phase === "error" ? "HALTED" : flowing ? "RUNNING" : "STANDBY";

  return (
    <div className="relative">
      <div
        className={cn(
          "tool-workflow-aura absolute -inset-1 rounded-[1.35rem] opacity-0 transition-opacity duration-700 pointer-events-none",
          flowing && "opacity-100",
          phase === "done" && "tool-workflow-aura--done opacity-100",
        )}
      />
      <div
        className={cn(
          "tool-workflow-rail relative rounded-2xl border p-4 md:p-5 overflow-hidden",
          phase === "done" && "tool-workflow-rail--done",
          phase === "error" && "tool-workflow-rail--error",
          flowing && "tool-workflow-rail--active",
        )}
      >
        <WorkflowParticles />
        <div className="tool-workflow-rail-shine absolute inset-0 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="tool-workflow-hub-icon flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Dev Hube</p>
                <p className="font-display text-sm font-semibold tracking-tight">Automation Pipeline</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "tool-workflow-status-badge text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border",
                  flowing && "tool-workflow-status-badge--live",
                  phase === "done" && "tool-workflow-status-badge--done",
                  phase === "error" && "tool-workflow-status-badge--error",
                )}
              >
                {statusLabel}
              </span>
              <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
                <div className="tool-workflow-progress-track h-1.5 flex-1 rounded-full overflow-hidden">
                  <div
                    className="tool-workflow-progress-fill h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${phase === "idle" ? 0 : progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-1 items-stretch gap-1 md:gap-0">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const done = active > i || phase === "done";
              const current = active === i;
              const err = phase === "error" && current;
              return (
                <div key={step.id} className="flex flex-1 items-center min-w-0">
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0 py-1">
                    <div className="relative">
                      {current && flowing ? (
                        <span className="tool-workflow-node-ring absolute -inset-2 rounded-2xl" />
                      ) : null}
                      <div
                        className={cn(
                          "tool-workflow-node relative flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-500",
                          done && !err && "tool-workflow-node--done",
                          current && !err && flowing && "tool-workflow-node--live",
                          err && "tool-workflow-node--error",
                          !done && !current && "opacity-50",
                        )}
                      >
                        {done && !err ? (
                          <Check className="h-5 w-5 text-emerald-400" />
                        ) : err ? (
                          <X className="h-5 w-5 text-red-400" />
                        ) : current && flowing ? (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="text-center min-w-0 px-1">
                      <p
                        className={cn(
                          "text-[10px] uppercase tracking-wider font-semibold truncate",
                          current ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground/80 truncate hidden sm:block">{step.sub}</p>
                    </div>
                  </div>
                  {i < steps.length - 1 ? (
                    <div className="tool-workflow-connector hidden md:flex flex-1 items-center px-1 -mt-8 max-w-[80px]">
                      <div className="h-[2px] w-full bg-border/30 relative overflow-visible rounded-full">
                        <div
                          className={cn(
                            "tool-workflow-beam absolute inset-y-0 left-0 h-full w-2/5 rounded-full",
                            (done || flowing) && "opacity-100",
                            !done && !flowing && "opacity-0",
                          )}
                        />
                        {flowing ? <span className="tool-workflow-packet" /> : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="sm:hidden">
            <div className="tool-workflow-progress-track h-1.5 w-full rounded-full overflow-hidden">
              <div
                className="tool-workflow-progress-fill h-full rounded-full transition-all duration-500"
                style={{ width: `${phase === "idle" ? 0 : progress}%` }}
              />
            </div>
          </div>
          <AutomationConsole />
          {message && phase !== "idle" ? (
            <p className="text-xs text-center text-muted-foreground animate-pulse">{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ToolWorkflowOverlay() {
  const { phase, progress, message, logs } = useCtx();
  const show = phase === "process" || phase === "input";
  if (!show) return null;
  const lastLog = logs[logs.length - 1] ?? "Orchestrating…";
  return (
    <div className="tool-workflow-overlay pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl overflow-hidden">
      <div className="tool-workflow-overlay-mesh absolute inset-0" />
      <div className="tool-workflow-overlay-grid absolute inset-0" />
      <div className="tool-workflow-scan absolute inset-0" />
      <div className="tool-workflow-overlay-vignette absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center gap-5 px-8 py-10 w-full max-w-md">
        <div className="relative">
          <div className="tool-workflow-ring-outer absolute -inset-6 rounded-full" />
          <div className="tool-workflow-ring-inner absolute -inset-3 rounded-full" />
          <div className="tool-workflow-orb h-20 w-20 rounded-full relative" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-display font-bold tabular-nums text-foreground">{progress}%</span>
          </div>
        </div>
        <div className="text-center space-y-2 w-full">
          <p className="text-sm font-semibold tracking-wide text-gradient-animated">Premium automation active</p>
          <p className="text-xs text-muted-foreground font-mono truncate w-full">{lastLog}</p>
        </div>
        <div className="flex gap-1.5 w-full justify-center">
          {[0, 1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className="tool-workflow-dot h-1 w-8 rounded-full bg-primary/30"
              style={{ animationDelay: `${n * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ToolWorkflowPane({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { phase } = useCtx();
  const dim = phase === "process" || phase === "input";
  return (
    <div className={cn("relative tool-workflow-pane", className)}>
      <ToolWorkflowOverlay />
      <div
        className={cn(
          "relative z-10 transition-all duration-700 ease-out",
          dim && "opacity-[0.55] scale-[0.995] blur-[0.4px] saturate-[0.82]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ToolPageShell({
  children,
  variant = "api",
}: {
  children: ReactNode;
  variant?: WorkflowVariant;
}) {
  return (
    <ToolWorkflowProvider defaultVariant={variant}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <ToolWorkflowRail />
        <ToolWorkflowPane>{children}</ToolWorkflowPane>
      </div>
    </ToolWorkflowProvider>
  );
}
