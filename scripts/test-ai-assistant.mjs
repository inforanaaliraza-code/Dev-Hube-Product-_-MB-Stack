const WORKER = process.env.AI_WORKER_URL ?? "http://127.0.0.1:8107";
const API = process.env.API_URL ?? "http://127.0.0.1:4000/api/v1";

async function step(name, fn) {
  try {
    const detail = await fn();
    console.log(`[PASS] ${name}${detail ? ` — ${detail}` : ""}`);
    return true;
  } catch (e) {
    console.log(`[FAIL] ${name} — ${e.message ?? e}`);
    return false;
  }
}

async function jsonOrText(res) {
  const t = await res.text();
  try {
    return JSON.parse(t);
  } catch {
    return { raw: t };
  }
}

async function main() {
  console.log("Dev Hube — AI stack test (Node)\n");

  await step("Worker /health", async () => {
    const res = await fetch(`${WORKER}/health`, { signal: AbortSignal.timeout(15000) });
    const body = await jsonOrText(res);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`);
    return `provider=${body.provider} configured=${body.configured}`;
  });

  await step("Worker /generate/code", async () => {
    const res = await fetch(`${WORKER}/generate/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "function sum(a,b){ return a+b }",
        language: "javascript",
      }),
      signal: AbortSignal.timeout(120000),
    });
    const body = await jsonOrText(res);
    if (!res.ok) {
      const d = body.detail ?? body.message ?? JSON.stringify(body);
      throw new Error(`HTTP ${res.status}: ${d}`);
    }
    return (body.code ?? "").slice(0, 80).replace(/\n/g, " ");
  });

  await step("Backend /ai-code-generator/health", async () => {
    const res = await fetch(`${API}/ai-code-generator/health`, {
      signal: AbortSignal.timeout(15000),
    });
    const body = await jsonOrText(res);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`);
    return `ok=${body.ok} configured=${body.configured} provider=${body.provider}`;
  });

  await step("Backend /ai-code-generator/generate", async () => {
    const res = await fetch(`${API}/ai-code-generator/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "function sum(a,b){ return a+b }",
        language: "javascript",
      }),
      signal: AbortSignal.timeout(120000),
    });
    const body = await jsonOrText(res);
    if (!res.ok) {
      const m = body.message ?? body.detail ?? JSON.stringify(body);
      throw new Error(`HTTP ${res.status}: ${m}`);
    }
    return (body.code ?? "").slice(0, 80).replace(/\n/g, " ");
  });

  console.log("\nDone.");
}

main();
