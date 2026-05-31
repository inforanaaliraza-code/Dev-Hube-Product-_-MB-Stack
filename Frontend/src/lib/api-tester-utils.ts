import type {
  ApiRequestDoc,
  ApiTestResponse,
  AuthConfig,
  BodyType,
  HttpMethod,
  KeyValueRow,
  TestAssertion,
  TestResult,
} from "@/lib/api-tester-types";

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyRow(): KeyValueRow {
  return { id: newId(), key: "", value: "", enabled: true };
}

export function defaultAuth(): AuthConfig {
  return {
    type: "none",
    token: "",
    username: "",
    password: "",
    apiKey: "",
    apiValue: "",
    apiIn: "header",
  };
}

export function createRequest(name = "New request"): ApiRequestDoc {
  return {
    id: newId(),
    name,
    method: "GET",
    url: "https://httpbin.org/get",
    params: [emptyRow()],
    headers: [
      { id: newId(), key: "Accept", value: "application/json", enabled: true },
      emptyRow(),
    ],
    auth: defaultAuth(),
    bodyType: "none",
    bodyRaw: "",
    bodyJson: '{\n  "name": "Dev Hube"\n}',
    formRows: [emptyRow()],
    tests: [
      {
        id: newId(),
        type: "status",
        target: "",
        expected: "200",
        enabled: true,
      },
    ],
  };
}

export function applyVariables(text: string, vars: KeyValueRow[]): string {
  let out = text;
  for (const v of vars) {
    if (!v.enabled || !v.key.trim()) continue;
    const key = v.key.trim();
    out = out.replaceAll(`{{${key}}}`, v.value);
    out = out.replaceAll(`{{${key.toUpperCase()}}}`, v.value);
    out = out.replaceAll(`{{${key.toLowerCase()}}}`, v.value);
  }
  return out;
}

export function methodTone(method: HttpMethod): string {
  const map: Record<HttpMethod, string> = {
    GET: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    POST: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    PUT: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    PATCH: "text-violet-400 border-violet-500/40 bg-violet-500/10",
    DELETE: "text-rose-400 border-rose-500/40 bg-rose-500/10",
    HEAD: "text-slate-300 border-slate-500/40 bg-slate-500/10",
    OPTIONS: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  };
  return map[method];
}

export function statusTone(status: number): string {
  if (status === 0) return "bg-rose-500/20 text-rose-300";
  if (status >= 200 && status < 300) return "bg-emerald-500/20 text-emerald-300";
  if (status >= 300 && status < 400) return "bg-amber-500/20 text-amber-300";
  if (status >= 400 && status < 500) return "bg-orange-500/20 text-orange-300";
  return "bg-rose-500/20 text-rose-300";
}

export function formatBodyPreview(body: string, kind: string): string {
  if (!body) return "";
  if (kind === "json") {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }
  return body;
}

export function buildSendPayload(req: ApiRequestDoc, envVars: KeyValueRow[]) {
  const url = applyVariables(req.url.trim(), envVars);
  const params = req.params.map((r) => ({
    key: applyVariables(r.key, envVars),
    value: applyVariables(r.value, envVars),
    enabled: r.enabled,
  }));
  const headers = req.headers.map((r) => ({
    key: applyVariables(r.key, envVars),
    value: applyVariables(r.value, envVars),
    enabled: r.enabled,
  }));
  const auth = { ...req.auth };
  if (auth.type === "bearer") auth.token = applyVariables(auth.token, envVars);
  if (auth.type === "basic") {
    auth.username = applyVariables(auth.username, envVars);
    auth.password = applyVariables(auth.password, envVars);
  }
  if (auth.type === "apikey") {
    auth.apiKey = applyVariables(auth.apiKey, envVars);
    auth.apiValue = applyVariables(auth.apiValue, envVars);
  }
  let body = "";
  let formData = req.formRows.map((r) => ({
    key: applyVariables(r.key, envVars),
    value: applyVariables(r.value, envVars),
    enabled: r.enabled,
  }));
  if (req.bodyType === "json") body = applyVariables(req.bodyJson, envVars);
  else if (req.bodyType === "raw") body = applyVariables(req.bodyRaw, envVars);
  else if (req.bodyType === "urlencoded" || req.bodyType === "form") {
    formData = formData;
  }
  return {
    url,
    method: req.method,
    queryParams: params,
    headers,
    auth: {
      type: auth.type,
      token: auth.token,
      username: auth.username,
      password: auth.password,
      key: auth.apiKey,
      value: auth.apiValue,
      addTo: auth.apiIn,
    },
    bodyType: req.bodyType as BodyType,
    body,
    formData,
    timeoutMs: 60000,
  };
}

export function runTests(tests: TestAssertion[], res: ApiTestResponse): TestResult[] {
  return tests
    .filter((t) => t.enabled)
    .map((t) => {
      if (t.type === "status") {
        const expected = Number(t.expected);
        const passed = res.status === expected;
        return {
          id: t.id,
          label: `Status is ${t.expected}`,
          passed,
          message: passed ? "Passed" : `Got ${res.status}`,
        };
      }
      if (t.type === "body_contains") {
        const passed = res.body.includes(t.expected);
        return {
          id: t.id,
          label: `Body contains "${t.expected}"`,
          passed,
          message: passed ? "Passed" : "Not found in body",
        };
      }
      if (t.type === "header") {
        const key = t.target.trim().toLowerCase();
        const val = Object.entries(res.headers).find(
          ([h]) => h.toLowerCase() === key,
        )?.[1];
        const passed = val === t.expected;
        return {
          id: t.id,
          label: `Header ${t.target} = ${t.expected}`,
          passed,
          message: passed ? "Passed" : `Got ${val ?? "(missing)"}`,
        };
      }
      if (t.type === "time_lt") {
        const max = Number(t.expected);
        const passed = res.durationMs < max;
        return {
          id: t.id,
          label: `Response time < ${t.expected}ms`,
          passed,
          message: passed ? "Passed" : `${res.durationMs}ms`,
        };
      }
      return { id: t.id, label: t.type, passed: false, message: "Unknown test" };
    });
}

export const STORAGE_COLLECTIONS = "devhube_api_collections";
export const STORAGE_ENVIRONMENTS = "devhube_api_environments";
export const STORAGE_HISTORY = "devhube_api_history";
export const STORAGE_ACTIVE = "devhube_api_active";
