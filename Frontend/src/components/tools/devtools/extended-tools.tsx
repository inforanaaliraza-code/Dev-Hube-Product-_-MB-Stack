"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { devtoolsApi } from "@/lib/devtools-api";
import {
  inferJsonSchema,
  jsonToPythonClass,
  jsonToTypeScript,
  jsonToXml,
  prettyHtml,
  prettyXml,
  validateXml,
  xmlToJson,
} from "@/lib/format-converters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className={cn(glassCard, "border-border/60 max-w-5xl mx-auto")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function runLocal(title: string, fn: (input: string) => string) {
  return function LocalTool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const { run, busy } = useWorkflowRunner();
    return (
      <Shell title={title}>
        <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
        <Button
          disabled={busy}
          onClick={() => {
            void run(async () => {
              const o = fn(input);
              setOutput(o);
              toast.success("Done");
            }, "Processing…").catch((e) => toast.error(e instanceof Error ? e.message : "Failed"));
          }}
        >
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Run
        </Button>
        <Textarea readOnly rows={12} value={output} className="font-mono text-sm" />
      </Shell>
    );
  };
}

export function FileEncodeDecodeTool() {
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const { run, busy } = useWorkflowRunner();

  const onFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      void run(async () => {
        if (mode === "encode") {
          const buf = await file.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
          setOutput(b64);
        } else {
          const text = await file.text();
          const bin = atob(text.trim());
          const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
          setOutput(`Binary size: ${bytes.length} bytes (download not shown — copy base64 decoded bytes in desktop app)`);
        }
        toast.success("File processed");
      }, "Reading file…").catch((e) => toast.error(e instanceof Error ? e.message : "Failed"));
    },
    [mode, run],
  );

  return (
    <Shell title="File Encode / Decode">
      <Select value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="encode">Encode file to Base64</SelectItem>
          <SelectItem value="decode">Decode Base64 file</SelectItem>
        </SelectContent>
      </Select>
      <Input type="file" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <Textarea readOnly rows={12} value={output} className="font-mono text-xs" />
    </Shell>
  );
}

export function StringUtilitiesTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const apply = (fn: (s: string) => string) => {
    setOutput(fn(input));
    toast.success("Done");
  };
  return (
    <Shell title="String Utilities">
      <Textarea rows={6} value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => apply((s) => s.trim())}>
          Trim
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => apply((s) => s.toUpperCase())}>
          Uppercase
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => apply((s) => s.toLowerCase())}>
          Lowercase
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => apply((s) => [...s].reverse().join(""))}>
          Reverse
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => apply((s) => s.replace(/\s+/g, " "))}>
          Collapse spaces
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => apply((s) => String(s.length))}>
          Length
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => apply((s) => s.split("").sort().join(""))}>
          Sort chars
        </Button>
      </div>
      <Textarea readOnly rows={8} value={output} />
    </Shell>
  );
}

export const HtmlFormatterTool = runLocal("HTML Formatter", (input) => prettyHtml(input));

export function JsonToXmlTool() {
  const [input, setInput] = useState('{"name":"Dev Hube"}');
  const [output, setOutput] = useState("");
  const { run, busy } = useWorkflowRunner();
  return (
    <Shell title="JSON to XML">
      <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void run(async () => {
            const parsed = JSON.parse(input) as unknown;
            setOutput(jsonToXml(parsed));
            toast.success("Converted");
          }, "Converting…").catch((e) => toast.error(e instanceof Error ? e.message : "Invalid JSON"));
        }}
      >
        Convert
      </Button>
      <Textarea readOnly rows={12} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export function JsonDiffTool() {
  const [left, setLeft] = useState("{}");
  const [right, setRight] = useState("{}");
  const [output, setOutput] = useState("");
  const { run, busy } = useWorkflowRunner();
  return (
    <Shell title="JSON Diff">
      <div className="grid sm:grid-cols-2 gap-3">
        <Textarea rows={10} value={left} onChange={(e) => setLeft(e.target.value)} placeholder="JSON A" />
        <Textarea rows={10} value={right} onChange={(e) => setRight(e.target.value)} placeholder="JSON B" />
      </div>
      <Button
        disabled={busy}
        onClick={() => {
          void run(async () => {
            const a = JSON.stringify(JSON.parse(left), null, 2);
            const b = JSON.stringify(JSON.parse(right), null, 2);
            const same = a === b;
            setOutput(same ? "No differences — objects are equal when normalized." : `Different.\n\nA:\n${a}\n\nB:\n${b}`);
            toast.success(same ? "Equal" : "Different");
          }, "Comparing…").catch((e) => toast.error(e instanceof Error ? e.message : "Invalid JSON"));
        }}
      >
        Compare
      </Button>
      <Textarea readOnly rows={12} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export function JsonSchemaGeneratorTool() {
  const [input, setInput] = useState('{"id":1,"name":"Ali"}');
  const [output, setOutput] = useState("");
  const { run, busy } = useWorkflowRunner();
  return (
    <Shell title="JSON Schema Generator">
      <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void run(async () => {
            const parsed = JSON.parse(input) as unknown;
            setOutput(JSON.stringify(inferJsonSchema(parsed), null, 2));
            toast.success("Schema generated");
          }, "Generating…").catch((e) => toast.error(e instanceof Error ? e.message : "Invalid JSON"));
        }}
      >
        Generate schema
      </Button>
      <Textarea readOnly rows={14} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export function JsonToCodeTool() {
  const [input, setInput] = useState('{"ok":true}');
  const [lang, setLang] = useState("typescript");
  const [output, setOutput] = useState("");
  const { run, busy } = useWorkflowRunner();
  return (
    <Shell title="JSON to Code">
      <Select value={lang} onValueChange={setLang}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="typescript">TypeScript</SelectItem>
          <SelectItem value="python">Python</SelectItem>
        </SelectContent>
      </Select>
      <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void run(async () => {
            setOutput(lang === "python" ? jsonToPythonClass(input) : jsonToTypeScript(input));
            toast.success("Generated");
          }, "Generating…").catch((e) => toast.error(e instanceof Error ? e.message : "Invalid JSON"));
        }}
      >
        Generate
      </Button>
      <Textarea readOnly rows={14} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export function XmlFormatterTool() {
  const [input, setInput] = useState("<root><item>Hi</item></root>");
  const [output, setOutput] = useState("");
  const { run, busy } = useWorkflowRunner();
  return (
    <Shell title="XML Formatter">
      <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void run(async () => {
            setOutput(prettyXml(input));
            toast.success("Formatted");
          }, "Formatting…").catch((e) => toast.error(e instanceof Error ? e.message : "Invalid XML"));
        }}
      >
        Format
      </Button>
      <Textarea readOnly rows={14} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export const XmlToJsonTool = runLocal("XML to JSON", (input) => xmlToJson(input));

export function XmlToCsvTool() {
  const [input, setInput] = useState("<rows><row><name>A</name></row></rows>");
  const [output, setOutput] = useState("");
  const { run, busy } = useWorkflowRunner();
  return (
    <Shell title="XML to CSV">
      <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void run(async () => {
            const json = JSON.parse(xmlToJson(input)) as Record<string, unknown>;
            const r = await devtoolsApi.jsonToCsv(JSON.stringify([json]));
            setOutput(r.csv);
            toast.success("Converted");
          }, "Converting…").catch((e) => toast.error(e instanceof Error ? e.message : "Failed"));
        }}
      >
        Convert
      </Button>
      <Textarea readOnly rows={10} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export function CsvToXmlTool() {
  const [input, setInput] = useState("name,age\nAli,30");
  const [output, setOutput] = useState("");
  const { run, busy } = useWorkflowRunner();
  return (
    <Shell title="CSV to XML">
      <Textarea rows={8} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void run(async () => {
            const r = await devtoolsApi.csvToJson(input);
            const rows = JSON.parse(r.json) as unknown[];
            const items = Array.isArray(rows) ? rows : [rows];
            const xmlItems = items.map((row) => jsonToXml(row, "row")).join("\n");
            setOutput(`<?xml version="1.0" encoding="UTF-8"?>\n<rows>\n${xmlItems}\n</rows>`);
            toast.success("Converted");
          }, "Converting…").catch((e) => toast.error(e instanceof Error ? e.message : "Failed"));
        }}
      >
        Convert
      </Button>
      <Textarea readOnly rows={14} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export function XmlValidatorTool() {
  const [input, setInput] = useState("<root/>");
  const [output, setOutput] = useState("");
  const { run, busy } = useWorkflowRunner();
  return (
    <Shell title="XML Validator">
      <Textarea rows={12} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void run(async () => {
            const r = validateXml(input);
            setOutput(r.valid ? "Valid XML ✓" : `Invalid: ${r.error}`);
            toast.success(r.valid ? "Valid" : "Invalid");
          }, "Validating…");
        }}
      >
        Validate
      </Button>
      <p className="text-sm font-mono">{output}</p>
    </Shell>
  );
}

export function XmlToCodeTool() {
  const [input, setInput] = useState("<root><id>1</id></root>");
  const [output, setOutput] = useState("");
  const { run, busy } = useWorkflowRunner();
  return (
    <Shell title="XML to Code">
      <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button
        disabled={busy}
        onClick={() => {
          void run(async () => {
            const json = xmlToJson(input);
            setOutput(jsonToTypeScript(json, "XmlRoot"));
            toast.success("Generated TypeScript from XML");
          }, "Generating…").catch((e) => toast.error(e instanceof Error ? e.message : "Failed"));
        }}
      >
        Generate TypeScript
      </Button>
      <Textarea readOnly rows={14} value={output} className="font-mono text-sm" />
    </Shell>
  );
}

export function EncryptDecryptTool() {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const { run, busy } = useWorkflowRunner();

  const deriveKey = async (salt: Uint8Array) => {
    const enc = new TextEncoder();
    const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  };

  return (
    <Shell title="Encrypt / Decrypt (AES-GCM)">
      <Select value={mode} onValueChange={(v) => setMode(v as "encrypt" | "decrypt")}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="encrypt">Encrypt</SelectItem>
          <SelectItem value="decrypt">Decrypt</SelectItem>
        </SelectContent>
      </Select>
      <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === "encrypt" ? "Plain text" : "Base64 payload"} />
      <Button
        disabled={busy || !password}
        onClick={() => {
          void run(async () => {
            if (mode === "encrypt") {
              const salt = crypto.getRandomValues(new Uint8Array(16));
              const iv = crypto.getRandomValues(new Uint8Array(12));
              const key = await deriveKey(salt);
              const cipher = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv },
                key,
                new TextEncoder().encode(text),
              );
              const pack = new Uint8Array(salt.length + iv.length + cipher.byteLength);
              pack.set(salt, 0);
              pack.set(iv, salt.length);
              pack.set(new Uint8Array(cipher), salt.length + iv.length);
              setOutput(btoa(String.fromCharCode(...pack)));
            } else {
              const raw = Uint8Array.from(atob(text.trim()), (c) => c.charCodeAt(0));
              const salt = raw.slice(0, 16);
              const iv = raw.slice(16, 28);
              const data = raw.slice(28);
              const key = await deriveKey(salt);
              const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
              setOutput(new TextDecoder().decode(plain));
            }
            toast.success("Done");
          }, "Working…").catch((e) => toast.error(e instanceof Error ? e.message : "Failed"));
        }}
      >
        {mode === "encrypt" ? "Encrypt" : "Decrypt"}
      </Button>
      <Textarea readOnly rows={8} value={output} className="font-mono text-xs break-all" />
    </Shell>
  );
}
