"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Copy, Loader2, Radio } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { convertImage, devtoolsApi } from "@/lib/devtools-api";
import { getWorkerHealth } from "@/lib/image-converter-api";
import { useWorkerHealth } from "@/components/tools/shared/use-worker-health";
import { WorkerStatusHint } from "@/components/tools/shared/worker-status-hint";
import {
  fetchMailbox,
  fetchMessage,
  getStoredMailboxId,
  listMessages,
  type TempMailbox,
} from "@/lib/temp-mail-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className={cn(glassCard, "border-border/60 max-w-5xl mx-auto")}>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function TextTool({
  title,
  run,
  inputRows = 8,
  outputRows = 10,
  actionLabel = "Run",
  processLabel = "Processing…",
}: {
  title: string;
  run: (input: string) => Promise<string>;
  inputRows?: number;
  outputRows?: number;
  actionLabel?: string;
  processLabel?: string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title={title}>
      <Textarea rows={inputRows} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const o = await run(input);
            setOutput(o);
            toast.success("Done");
            return o;
          }, processLabel).catch((e) =>
            toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Failed"),
          );
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        {actionLabel}
      </Button>
      <Textarea rows={outputRows} readOnly value={output} className={cn("font-mono text-sm fade-in", output && "ring-1 ring-primary/20")} />
    </Shell>
  );
}

export function MetaTagsGeneratorTool() {
  const [title, setTitle] = useState("Dev Hube");
  const [description, setDescription] = useState("Free developer tools");
  const [url, setUrl] = useState("https://devhube.com");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="Meta Tags Generator">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.metaTags({ title, description, url });
            setOutput(r.html);
            toast.success("Meta tags ready");
          }, "Building meta tags…").catch((e) => toast.error(String(e)));
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Generate
      </Button>
      <Textarea readOnly rows={12} value={output} className={cn("font-mono text-sm fade-in", output && "ring-1 ring-primary/20")} />
    </Shell>
  );
}

export function RobotsTxtTool() {
  const [disallow, setDisallow] = useState("/admin");
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="Robots.txt Generator">
      <Input value={disallow} onChange={(e) => setDisallow(e.target.value)} placeholder="Disallow path" />
      <Input value={sitemap} onChange={(e) => setSitemap(e.target.value)} placeholder="Sitemap URL" />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.robotsTxt({ rules: [{ agent: "*", allow: [], disallow: [disallow] }], sitemap });
            setOutput(r.content);
            toast.success("robots.txt ready");
          }, "Generating robots.txt…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Generate
      </Button>
      <Textarea readOnly rows={8} value={output} />
    </Shell>
  );
}

export function SitemapGeneratorTool() {
  return <TextTool title="Sitemap Generator" run={async (urls) => (await devtoolsApi.sitemap(urls)).xml} inputRows={10} outputRows={14} />;
}

export function JsonValidatorTool() {
  return <TextTool title="JSON Validator" run={async (json) => { const r = await devtoolsApi.jsonValidate(json); return r.valid ? r.formatted ?? "" : r.error ?? "Invalid"; }} />;
}

export function JsonFormatterTool() {
  const [minify, setMinify] = useState(false);
  const [input, setInput] = useState('{"hello":"world"}');
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="JSON Formatter">
      <div className="flex items-center gap-2"><Label>Minify</Label><input type="checkbox" checked={minify} onChange={(e) => setMinify(e.target.checked)} /></div>
      <Textarea rows={8} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.jsonFormat(input, minify);
            setOutput(r.output);
            toast.success("JSON formatted");
          }, "Formatting JSON…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Format
      </Button>
      <Textarea readOnly rows={10} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export const CssMinifierTool = () => <TextTool title="CSS Minifier" run={async (css) => (await devtoolsApi.cssMinify(css)).output} />;
export const JsBeautifierTool = () => <TextTool title="JavaScript Beautifier" run={async (c) => (await devtoolsApi.jsBeautify(c)).output} />;
export const HtmlToMarkdownTool = () => <TextTool title="HTML to Markdown" run={async (h) => (await devtoolsApi.htmlToMarkdown(h)).markdown} />;

export function RegexTesterTool() {
  const [pattern, setPattern] = useState("\\d+");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Order 12345");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="Regex Tester">
      <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Pattern" />
      <Input value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="Flags" />
      <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.regexTest(pattern, text, flags);
            setOutput(JSON.stringify(r.matches, null, 2));
            toast.success(`${r.count} match(es)`);
          }, "Testing pattern…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Test
      </Button>
      <Textarea readOnly rows={8} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export function CsvJsonTool() {
  const [csv, setCsv] = useState("name,role\nAli,dev");
  const [json, setJson] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="CSV ⇄ JSON">
      <Textarea rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} />
      <div className="flex gap-2">
        <Button
          disabled={busy}
          onClick={() => {
            void flowRun(async () => {
              const r = await devtoolsApi.csvToJson(csv);
              setJson(r.json);
              toast.success("Converted to JSON");
            }, "CSV → JSON…");
          }}
        >
          CSV → JSON
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => {
            void flowRun(async () => {
              const r = await devtoolsApi.jsonToCsv(json || "[]");
              setCsv(r.csv);
              toast.success("Converted to CSV");
            }, "JSON → CSV…");
          }}
        >
          JSON → CSV
        </Button>
      </div>
      <Textarea rows={10} value={json} onChange={(e) => setJson(e.target.value)} className="font-mono text-sm" />
    </Shell>
  );
}

export function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [text, setText] = useState("Hello");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="Base64 Encoder">
      <Select value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="encode">Encode</SelectItem><SelectItem value="decode">Decode</SelectItem></SelectContent></Select>
      <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.base64(text, mode);
            setOutput(r.output);
            toast.success("Converted");
          }, "Base64…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Convert
      </Button>
      <Textarea readOnly rows={5} value={output} />
    </Shell>
  );
}

export function JwtDecoderTool() {
  return <TextTool title="JWT Decoder" run={async (t) => JSON.stringify(await devtoolsApi.jwtDecode(t), null, 2)} inputRows={4} />;
}

export function UrlEncoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [text, setText] = useState("hello world");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="URL Encoder">
      <Select value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="encode">Encode</SelectItem><SelectItem value="decode">Decode</SelectItem></SelectContent></Select>
      <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.urlEncode(text, mode);
            setOutput(r.output);
          }, "URL encode…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Convert
      </Button>
      <Textarea readOnly rows={4} value={output} />
    </Shell>
  );
}

export function UuidGeneratorTool() {
  const [version, setVersion] = useState("v4");
  const [count, setCount] = useState("5");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="UUID Generator">
      <div className="grid grid-cols-2 gap-2">
        <Select value={version} onValueChange={setVersion}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="v4">v4</SelectItem><SelectItem value="v1">v1</SelectItem><SelectItem value="v7">v7</SelectItem></SelectContent></Select>
        <Input value={count} onChange={(e) => setCount(e.target.value)} placeholder="Count" />
      </div>
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.uuidGenerate(version, Math.min(50, Math.max(1, Number(count) || 1)));
            setOutput(r.uuids.join("\n"));
            toast.success("UUIDs generated");
          }, "Generating UUIDs…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Generate
      </Button>
      <Textarea readOnly rows={6} value={output} />
    </Shell>
  );
}

export function OtpDetectorTool() {
  return <TextTool title="OTP Detector" run={async (t) => JSON.stringify(await devtoolsApi.otpDetect({ text: t }), null, 2)} inputRows={6} />;
}

export function CodeReaderTool() {
  const [mailbox, setMailbox] = useState<TempMailbox | null>(null);
  const [liveCodes, setLiveCodes] = useState<Array<{ code: string; subject: string; from: string }>>([]);
  const [paste, setPaste] = useState("");
  const [pastePrimary, setPastePrimary] = useState<string | null>(null);
  const { run: flowRun, busy } = useWorkflowRunner("stream");

  const pollInbox = useCallback(async () => {
    const id = getStoredMailboxId();
    if (!id) {
      setMailbox(null);
      setLiveCodes([]);
      return;
    }
    try {
      const mb = await fetchMailbox(id);
      setMailbox(mb);
      const msgs = await listMessages(id);
      const rows: Array<{ code: string; subject: string; from: string }> = [];
      for (const m of msgs.slice(0, 15)) {
        if (m.otpCode) {
          rows.push({ code: m.otpCode, subject: m.subject, from: m.from });
          continue;
        }
        try {
          const d = await fetchMessage(id, m.id);
          for (const code of d.otpCodes) {
            rows.push({ code, subject: m.subject, from: m.from });
          }
        } catch {}
      }
      const seen = new Set<string>();
      setLiveCodes(rows.filter((r) => { if (seen.has(r.code)) return false; seen.add(r.code); return true; }));
    } catch {
      setMailbox(null);
      setLiveCodes([]);
    }
  }, []);

  useEffect(() => {
    pollInbox();
    const t = setInterval(pollInbox, 5000);
    return () => clearInterval(t);
  }, [pollInbox]);

  return (
    <Shell title="Auto Code Reader">
      {mailbox ? (
        <p className="text-sm text-muted-foreground">Listening on <span className="font-mono text-foreground">{mailbox.address}</span> (refreshes every 5s)</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Open <Link href="/tools/temp-mail" className="text-primary underline">Temp Mail</Link> first to create an inbox, then codes appear here automatically.
        </p>
      )}
      {liveCodes.length > 0 ? (
        <div className="space-y-2">
          {liveCodes.map((row) => (
            <div key={row.code} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-3">
              <div>
                <p className="font-mono text-2xl font-semibold tracking-widest">{row.code}</p>
                <p className="text-xs text-muted-foreground truncate">{row.subject || row.from}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(row.code); toast.success("Copied"); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Radio className="h-4 w-4 animate-pulse" />
          Waiting for verification emails…
        </div>
      )}
      <p className="text-xs text-muted-foreground pt-2">Or paste message text below</p>
      <Textarea rows={5} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste SMS or email body" />
      <Button
        disabled={busy || !paste.trim()}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.codeReader({ text: paste });
            setPastePrimary(r.primary);
            toast.success(r.primary ? "Code found" : "No code found");
          }, "Extracting code…").catch((e) => toast.error(String(e)));
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Extract from text
      </Button>
      {pastePrimary ? <p className="font-mono text-xl">{pastePrimary}</p> : null}
    </Shell>
  );
}

export function ColorPickerTool() {
  const [hex, setHex] = useState("#6366F1");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="Color Picker">
      <Input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-12 w-24" />
      <Input value={hex} onChange={(e) => setHex(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.colorPicker(hex);
            setOutput(JSON.stringify(r, null, 2));
          }, "Converting color…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Convert
      </Button>
      <Textarea readOnly rows={6} value={output} />
    </Shell>
  );
}

export function ContrastCheckerTool() {
  const [fg, setFg] = useState("#111111");
  const [bg, setBg] = useState("#ffffff");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="Contrast Checker">
      <div className="grid grid-cols-2 gap-4">
        <Input value={fg} onChange={(e) => setFg(e.target.value)} placeholder="Foreground" />
        <Input value={bg} onChange={(e) => setBg(e.target.value)} placeholder="Background" />
      </div>
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.contrastCheck(fg, bg);
            setOutput(JSON.stringify(r, null, 2));
          }, "Checking contrast…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Check
      </Button>
      <Textarea readOnly rows={5} value={output} />
    </Shell>
  );
}

export function LoremIpsumTool() {
  return <TextTool title="Lorem Ipsum" run={async () => (await devtoolsApi.loremIpsum("paragraphs", 3)).text} inputRows={2} />;
}

export function CaseConverterTool() {
  const [mode, setMode] = useState("camel");
  const [text, setText] = useState("hello world example");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="Case Converter">
      <Select value={mode} onValueChange={setMode}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["upper","lower","title","camel","snake","kebab"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
      <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.caseConvert(text, mode);
            setOutput(r.output);
          }, "Converting case…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Convert
      </Button>
      <Textarea readOnly rows={3} value={output} />
    </Shell>
  );
}

export function TextDiffTool() {
  const [left, setLeft] = useState("line one\nline two");
  const [right, setRight] = useState("line one\nline three");
  const [parts, setParts] = useState<Array<{ value: string; added: boolean; removed: boolean }>>([]);
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="Text Diff">
      <div className="grid md:grid-cols-2 gap-4">
        <Textarea rows={8} value={left} onChange={(e) => setLeft(e.target.value)} />
        <Textarea rows={8} value={right} onChange={(e) => setRight(e.target.value)} />
      </div>
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.textDiff(left, right);
            setParts(r.parts);
            toast.success("Diff ready");
          }, "Comparing text…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Diff
      </Button>
      <pre className="text-xs p-4 rounded-lg border border-border/50 bg-black/30 overflow-auto max-h-80">{parts.map((p, i) => (
        <span key={i} className={p.added ? "text-emerald-400" : p.removed ? "text-red-400" : ""}>{p.value}</span>
      ))}</pre>
    </Shell>
  );
}

export function WordCounterTool() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  return (
    <Shell title="Word Counter">
      <Textarea rows={8} value={text} onChange={(e) => { setText(e.target.value); devtoolsApi.wordCount(e.target.value).then(setStats); }} />
      {stats ? <pre className="text-sm">{JSON.stringify(stats, null, 2)}</pre> : null}
    </Shell>
  );
}

export const HtmlStripperTool = () => <TextTool title="HTML Stripper" run={async (h) => (await devtoolsApi.htmlStrip(h)).text} />;

export function TimestampConverterTool() {
  const [value, setValue] = useState(String(Math.floor(Date.now() / 1000)));
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();

  const convert = async (mode: "toDate" | "fromDate") => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Enter a value first");
      return;
    }
    if (mode === "fromDate" && /^-?\d+(\.\d+)?$/.test(trimmed)) {
      toast.error("Enter a date string (e.g. 2024-06-05T12:00:00Z), not a Unix number");
      return;
    }
    if (mode === "toDate" && !/^-?\d+(\.\d+)?$/.test(trimmed)) {
      toast.error("Enter a Unix timestamp (digits only)");
      return;
    }
    try {
      await flowRun(async () => {
        const r = await devtoolsApi.timestamp(trimmed, mode);
        setOutput(JSON.stringify(r, null, 2));
      }, "Converting…");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Conversion failed");
    }
  };

  return (
    <Shell title="Timestamp Converter">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Unix: 1715000000 · Date: 2024-06-05T12:00:00Z"
      />
      <p className="text-xs text-muted-foreground">
        Unix → Date needs digits only. Date → Unix needs an ISO or readable date string.
      </p>
      <div className="flex gap-2">
        <Button disabled={busy} onClick={() => void convert("toDate")}>
          Unix → Date
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => void convert("fromDate")}>
          Date → Unix
        </Button>
      </div>
      <Textarea readOnly rows={6} value={output} />
    </Shell>
  );
}

export const CronParserTool = () => <TextTool title="Cron Parser" run={async (e) => JSON.stringify(await devtoolsApi.cronParse(e), null, 2)} inputRows={2} />;
export const HashGeneratorTool = () => <TextTool title="Hash Generator" run={async (t) => JSON.stringify((await devtoolsApi.hashGenerate(t)).hashes, null, 2)} inputRows={4} />;

export function ImageConverterTool() {
  const [format, setFormat] = useState("webp");
  const [preview, setPreview] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { run: flowRun, busy } = useWorkflowRunner("file");
  const { healthy } = useWorkerHealth(getWorkerHealth);
  return (
    <Shell title="Image Converter">
      <Select value={format} onValueChange={setFormat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["png","jpg","webp","gif"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          void flowRun(async () => {
            const r = await convertImage(f, format);
            setPreview(`data:${r.mime};base64,${r.imageBase64}`);
            toast.success("Image converted");
          }, "Converting image…").catch((err) => toast.error(err instanceof ApiError ? err.message : String(err)));
        }}
      />
      <Button disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Upload & Convert
      </Button>
      <WorkerStatusHint healthy={healthy} />
      {preview ? (
        <div className="space-y-2">
          <img src={preview} alt="converted" className="max-h-64 rounded-lg border" />
          <Button variant="outline" size="sm" asChild><a href={preview} download={`converted.${format}`}>Download</a></Button>
        </div>
      ) : null}
    </Shell>
  );
}

export function UnitConverterTool() {
  const [value, setValue] = useState("16");
  const [from, setFrom] = useState("px");
  const [to, setTo] = useState("rem");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="CSS Unit Converter">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Select value={from} onValueChange={setFrom}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["px","rem","em","%","vh","vw"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
        <Select value={to} onValueChange={setTo}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["px","rem","em","%","vh","vw"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
      </div>
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.unitConvert(Number(value), from, to, 16);
            setOutput(JSON.stringify(r, null, 2));
          }, "Converting units…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Convert
      </Button>
      <Textarea readOnly rows={4} value={output} />
    </Shell>
  );
}

export const UserAgentParserTool = () => <TextTool title="User-Agent Parser" run={async (ua) => JSON.stringify(await devtoolsApi.userAgentParse(ua), null, 2)} inputRows={3} />;

export function HtmlEntitiesTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [text, setText] = useState("<div>Hello</div>");
  const [output, setOutput] = useState("");
  const { run: flowRun, busy } = useWorkflowRunner();
  return (
    <Shell title="HTML Entities">
      <Select value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="encode">Encode</SelectItem><SelectItem value="decode">Decode</SelectItem></SelectContent></Select>
      <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void flowRun(async () => {
            const r = await devtoolsApi.htmlEntities(text, mode);
            setOutput(r.output);
          }, "Converting entities…");
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Convert
      </Button>
      <Textarea readOnly rows={5} value={output} />
    </Shell>
  );
}
