#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const API_BASE = (process.env.API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");
const FRONTEND_BASE = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
const CHECK_FRONTEND = process.env.CHECK_FRONTEND !== "false";
const CHECK_API = process.env.CHECK_API !== "false";
const TIMEOUT_MS = Number(process.env.AUDIT_TIMEOUT_MS || 15000);

const VALID_ICONS = new Set([
  "mail", "inbox", "qr-code", "minimize-2", "file-text", "file-stack", "scissors", "bot",
  "database", "lock", "palette", "file-code", "user-round", "youtube", "scan-text", "mic",
  "refresh-cw", "wand-2", "search", "map-pin", "gauge", "tags", "map", "braces", "minus",
  "code-2", "file-down", "regex", "file-spreadsheet", "binary", "key-round", "link-2", "hash",
  "send", "shield-check", "radio", "pipette", "type", "align-left", "diff", "calculator",
  "eraser", "clock", "fingerprint", "image", "ruler", "globe",
]);

const CLIENT_ONLY = new Set([
  "file-encode-decode",
  "string-utilities",
  "html-formatter",
  "json-to-xml",
  "json-diff",
  "json-schema-generator",
  "json-to-code",
  "xml-formatter",
  "xml-to-json",
  "xml-to-csv",
  "csv-to-xml",
  "xml-validator",
  "xml-to-code",
  "encrypt-decrypt",
]);

const WORKER_BACKEND = new Set([
  "temp-mail",
  "qr-generator",
  "image-compressor",
  "pdf-to-word",
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "ai-code-generator",
  "ai-resume-builder",
  "ai-paraphrase",
  "ai-humanizer",
  "image-to-text",
  "speech-to-text",
  "image-converter",
]);

function read(path) {
  return readFileSync(join(ROOT, path), "utf8");
}

function extractSlugsFromToolsTs(source) {
  return [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

function extractRegistryKeys(source) {
  const block = source.match(/TOOL_COMPONENTS[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!block) return [];
  const quoted = [...block[1].matchAll(/"([^"]+)":/g)].map((m) => m[1]);
  const bare = [...block[1].matchAll(/^\s+([a-z][a-z0-9-]*):/gm)].map((m) => m[1]);
  return [...new Set([...quoted, ...bare])];
}

function extractNavSlugs(source) {
  return [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

function extractSeedSlugs(source) {
  return [...source.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
}

function extractIcons(source) {
  const icons = [];
  const re = /slug:\s*"([^"]+)"[\s\S]*?icon:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(source))) icons.push({ slug: m[1], icon: m[2] });
  return icons;
}

function extractStatuses(source) {
  const statuses = [];
  const re = /slug:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(source))) statuses.push({ slug: m[1], status: m[2] });
  return statuses;
}

async function fetchJson(url, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    const text = await res.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    return { ok: false, status: 0, body: null, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

function healthPath(slug) {
  return `${API_BASE}/${slug}/health`;
}

const POST_SMOKE = {
  base64: { path: "/base64/convert", body: { text: "hi", mode: "encode" } },
  "url-encoder": { path: "/url-encoder/convert", body: { text: "a b", mode: "encode" } },
  "jwt-decoder": {
    path: "/jwt-decoder/decode",
    body: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
    },
  },
  "json-validator": { path: "/json-validator/validate", body: { json: '{"ok":true}' } },
  "json-formatter": { path: "/json-formatter/format", body: { json: '{"a":1}' } },
  "css-minifier": { path: "/css-minifier/minify", body: { css: ".a{color:red}" } },
  "js-beautifier": { path: "/js-beautifier/beautify", body: { code: "const a=1" } },
  "html-to-markdown": { path: "/html-to-markdown/convert", body: { html: "<p>Hi</p>" } },
  "regex-tester": { path: "/regex-tester/test", body: { pattern: "\\d+", text: "a1" } },
  "csv-to-json": { path: "/csv-to-json/to-json", body: { csv: "a,b\n1,2" } },
  "csv-to-xml": { path: "/csv-to-json/to-json", body: { csv: "a,b\n1,2" } },
  "xml-to-csv": { path: "/csv-to-json/to-json", body: { csv: "a,b\n1,2" } },
  "uuid-generator": { path: "/uuid-generator/generate", body: { version: "v4", count: 1 } },
  "lorem-ipsum": { path: "/lorem-ipsum/generate", body: { type: "words", count: 5 } },
  "case-converter": { path: "/case-converter/convert", body: { text: "hello world", mode: "camel" } },
  "text-diff": { path: "/text-diff/diff", body: { left: "a", right: "b" } },
  "word-counter": { path: "/word-counter/count", body: { text: "hello" } },
  "html-stripper": { path: "/html-stripper/strip", body: { html: "<b>x</b>" } },
  "timestamp-converter": {
    path: "/timestamp-converter/convert",
    body: { value: "2024-06-05T12:00:00.000Z", mode: "fromDate" },
  },
  "cron-parser": { path: "/cron-parser/parse", body: { expression: "0 9 * * *" } },
  "hash-generator": { path: "/hash-generator/generate", body: { text: "test" } },
  "html-entities": { path: "/html-entities/convert", body: { text: "<div>", mode: "encode" } },
  "color-picker": { path: "/color-picker/convert", body: { hex: "#7c3aed" } },
  "contrast-checker": {
    path: "/contrast-checker/check",
    body: { foreground: "#ffffff", background: "#000000" },
  },
  "unit-converter": {
    path: "/unit-converter/convert",
    body: { value: 16, from: "px", to: "rem", rootPx: 16 },
  },
  "user-agent-parser": {
    path: "/user-agent-parser/parse",
    body: { ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0" },
  },
  "meta-tags-generator": {
    path: "/meta-tags-generator/generate",
    body: { title: "T", description: "D", url: "https://example.com" },
  },
  "robots-txt": {
    path: "/robots-txt/generate",
    body: { rules: [{ agent: "*", allow: ["/"], disallow: [] }], sitemap: "https://x.com/s.xml" },
  },
  "sitemap-generator": {
    path: "/sitemap-generator/generate",
    body: { urls: "https://example.com" },
  },
  "whois-lookup": { path: "/whois-lookup/lookup", body: { domain: "google.com" } },
  "ip-lookup": { path: "/ip-lookup/lookup", body: { ip: "8.8.8.8" } },
  "speed-test": { path: "/speed-test/run", body: { url: "https://example.com" } },
  "youtube-thumbnail": {
    path: "/youtube-thumbnail/resolve",
    body: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  },
  "password-generator": {
    path: "/password-generator/generate",
    body: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: false },
  },
  "palette-generator": {
    path: "/palette-generator/generate",
    body: { mode: "analogous", baseColor: "#7c3aed", count: 5 },
  },
  "markdown-editor": {
    path: "/markdown-editor/preview",
    body: { markdown: "# Hello" },
  },
  "sql-formatter": {
    path: "/sql-formatter/format",
    body: { sql: "select 1" },
  },
  "otp-detector": {
    path: "/otp-detector/detect",
    body: { text: "Your code is 123456" },
  },
  "code-reader": {
    path: "/code-reader/detect",
    body: { text: "Code: 654321" },
  },
};

async function main() {
  const toolsSource = read("Frontend/src/lib/tools.ts");
  const registrySource = read("Frontend/src/app/tools/tool-registry.tsx");
  const navSource = read("Frontend/src/lib/tool-nav.ts");
  const seedSource = read("Backend/src/tools/data/tools.seed.ts");

  const catalogSlugs = extractSlugsFromToolsTs(toolsSource);
  const registrySlugs = extractRegistryKeys(registrySource);
  const navSlugs = [...new Set(extractNavSlugs(navSource))];
  const seedSlugs = extractSeedSlugs(seedSource);
  const icons = extractIcons(toolsSource);
  const statuses = extractStatuses(toolsSource);

  const issues = [];
  const warnings = [];
  const results = [];

  const catalogSet = new Set(catalogSlugs);
  const registrySet = new Set(registrySlugs);
  const navSet = new Set(navSlugs);
  const seedSet = new Set(seedSlugs);

  for (const slug of catalogSlugs) {
    if (!registrySet.has(slug)) issues.push(`Missing UI component: ${slug}`);
    if (!navSet.has(slug)) issues.push(`Not in top nav menu: ${slug}`);
    if (!seedSet.has(slug)) warnings.push(`Missing backend seed: ${slug}`);
  }
  for (const slug of registrySlugs) {
    if (!catalogSet.has(slug)) issues.push(`Registry orphan (not in tools.ts): ${slug}`);
  }
  for (const slug of navSlugs) {
    if (!catalogSet.has(slug)) issues.push(`Nav references unknown slug: ${slug}`);
  }

  for (const { slug, icon } of icons) {
    if (!VALID_ICONS.has(icon)) issues.push(`Invalid icon "${icon}" for ${slug}`);
  }
  for (const { slug, status } of statuses) {
    if (status !== "ready") issues.push(`Tool not ready: ${slug} (${status})`);
    if (status === "ready" && !registrySet.has(slug)) issues.push(`Ready but no component: ${slug}`);
  }

  if (CHECK_API) {
    const apiHealth = await fetchJson(`${API_BASE}/health`);
    if (!apiHealth.ok) {
      issues.push(`Backend unreachable at ${API_BASE}/health — start Backend first`);
    } else {
      for (const slug of catalogSlugs) {
        const entry = { slug, health: "skip", smoke: "skip", note: "" };

        if (CLIENT_ONLY.has(slug)) {
          entry.health = "client-only";
          entry.note = "Runs in browser only";
          results.push(entry);
          continue;
        }

        const h = await fetchJson(healthPath(slug));
        if (h.ok) {
          entry.health = "ok";
          if (WORKER_BACKEND.has(slug) && h.body && h.body.worker === false) {
            entry.health = "warn";
            entry.note = "API up but Python worker down";
            warnings.push(`${slug}: worker not running`);
          }
        } else {
          entry.health = "fail";
          entry.note = h.error || `HTTP ${h.status}`;
          issues.push(`Health failed: ${slug} — ${entry.note}`);
        }

        const smoke = POST_SMOKE[slug];
        if (smoke) {
          const s = await fetchJson(`${API_BASE}${smoke.path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(smoke.body),
          });
          if (s.ok) entry.smoke = "ok";
          else {
            entry.smoke = "fail";
            issues.push(`Smoke POST failed: ${slug} — ${s.error || `HTTP ${s.status}`}`);
          }
        } else if (!CLIENT_ONLY.has(slug) && !WORKER_BACKEND.has(slug)) {
          entry.smoke = "health-only";
        } else if (WORKER_BACKEND.has(slug)) {
          entry.smoke = "worker";
        }

        results.push(entry);
      }
    }
  }

  if (CHECK_FRONTEND) {
    for (const slug of catalogSlugs) {
      const page = await fetchJson(`${FRONTEND_BASE}/tools/${slug}`, {
        method: "GET",
        headers: { Accept: "text/html" },
      });
      if (!page.ok) {
        warnings.push(`Frontend page /tools/${slug} — ${page.error || `HTTP ${page.status}`}`);
      }
    }
  }

  const readyCount = catalogSlugs.filter((s) => statuses.find((x) => x.slug === s)?.status === "ready").length;

  console.log("\n=== Dev Hube — Tools Audit ===\n");
  console.log(`Total tools (catalog):  ${catalogSlugs.length}`);
  console.log(`Ready tools:            ${readyCount}`);
  console.log(`UI components:          ${registrySlugs.length}`);
  console.log(`Nav menu entries:       ${navSlugs.length} unique slugs`);
  console.log(`Backend seed entries:   ${seedSlugs.length}`);
  console.log(`API base:               ${API_BASE}`);
  console.log(`Frontend base:          ${FRONTEND_BASE}`);

  const clientOnly = catalogSlugs.filter((s) => CLIENT_ONLY.has(s));
  const workerTools = catalogSlugs.filter((s) => WORKER_BACKEND.has(s));
  const apiDevtools = catalogSlugs.filter((s) => !CLIENT_ONLY.has(s) && !WORKER_BACKEND.has(s));

  console.log(`\nBreakdown:`);
  console.log(`  Browser-only tools:     ${clientOnly.length}`);
  console.log(`  Worker-backed tools:    ${workerTools.length}`);
  console.log(`  API devtools/utility:   ${apiDevtools.length}`);

  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  }

  if (issues.length) {
    console.log(`\nIssues (${issues.length}):`);
    issues.forEach((i) => console.log(`  ✗ ${i}`));
  } else {
    console.log("\n✓ No blocking issues found.");
  }

  const failedHealth = results.filter((r) => r.health === "fail");
  const warnHealth = results.filter((r) => r.health === "warn");
  if (results.length) {
    console.log(`\nAPI health: ${results.filter((r) => r.health === "ok").length} ok, ${warnHealth.length} warn, ${failedHealth.length} fail, ${clientOnly.length} client-only`);
  }

  console.log("\nRun: API_URL=http://localhost:4000/api/v1 FRONTEND_URL=http://localhost:3000 node scripts/audit-all-tools.mjs\n");

  process.exit(issues.length > 0 ? 1 : 0);
}

main();
