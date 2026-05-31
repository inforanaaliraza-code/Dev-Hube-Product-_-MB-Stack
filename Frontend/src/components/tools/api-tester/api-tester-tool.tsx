"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FolderPlus,
  History,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type {
  ApiCollection,
  ApiEnvironment,
  ApiRequestDoc,
  ApiTestResponse,
  HistoryEntry,
  KeyValueRow,
  HttpMethod,
  TestResult,
} from "@/lib/api-tester-types";
import {
  STORAGE_ACTIVE,
  STORAGE_COLLECTIONS,
  STORAGE_ENVIRONMENTS,
  STORAGE_HISTORY,
  applyVariables,
  buildSendPayload,
  createRequest,
  emptyRow,
  formatBodyPreview,
  methodTone,
  newId,
  runTests,
  statusTone,
} from "@/lib/api-tester-utils";
import { devtoolsApi } from "@/lib/devtools-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowRunner } from "@/components/tools/shared/tool-workflow";
import { cn } from "@/lib/utils";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function KeyValueEditor({
  rows,
  onChange,
  placeholders,
}: {
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
  placeholders?: { key: string; value: string };
}) {
  const update = (id: string, patch: Partial<KeyValueRow>) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const add = () => onChange([...rows, emptyRow()]);
  const remove = (id: string) => {
    const next = rows.filter((r) => r.id !== id);
    onChange(next.length ? next : [emptyRow()]);
  };
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[28px_1fr_1fr_36px] gap-2 text-xs text-muted-foreground px-1">
        <span />
        <span>Key</span>
        <span>Value</span>
        <span />
      </div>
      {rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[28px_1fr_1fr_36px] gap-2 items-center">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => update(row.id, { enabled: e.target.checked })}
            className="accent-fuchsia-500"
          />
          <Input
            value={row.key}
            onChange={(e) => update(row.id, { key: e.target.value })}
            placeholder={placeholders?.key ?? "key"}
            className="h-8 font-mono text-xs"
          />
          <Input
            value={row.value}
            onChange={(e) => update(row.id, { value: e.target.value })}
            placeholder={placeholders?.value ?? "value"}
            className="h-8 font-mono text-xs"
          />
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove(row.id)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add row
      </Button>
    </div>
  );
}

export function ApiTesterTool() {
  const { run: flowRun, busy } = useWorkflowRunner("stream");
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [activeEnvId, setActiveEnvId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ApiRequestDoc>(() => createRequest("Untitled"));
  const [sidebarTab, setSidebarTab] = useState<"collections" | "history">("collections");
  const [response, setResponse] = useState<ApiTestResponse | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [responseTab, setResponseTab] = useState("body");

  useEffect(() => {
    const cols = loadJson<ApiCollection[]>(STORAGE_COLLECTIONS, []);
    const envs = loadJson<ApiEnvironment[]>(STORAGE_ENVIRONMENTS, [
      {
        id: newId(),
        name: "Local Dev",
        variables: [
          { id: newId(), key: "baseUrl", value: "http://localhost:4000/api/v1", enabled: true },
          { id: newId(), key: "token", value: "", enabled: true },
        ],
      },
    ]);
    const hist = loadJson<HistoryEntry[]>(STORAGE_HISTORY, []);
    const active = loadJson<{ collectionId: string | null; requestId: string | null; envId: string | null }>(
      STORAGE_ACTIVE,
      { collectionId: null, requestId: null, envId: null },
    );
    if (!cols.length) {
      const col: ApiCollection = {
        id: newId(),
        name: "Dev Hube Samples",
        requests: [
          createRequest("Health check"),
          {
            ...createRequest("JSON POST"),
            method: "POST",
            url: "{{baseUrl}}/json-validator/validate",
            bodyType: "json",
            bodyJson: '{\n  "json": "{\\"ok\\": true}"\n}',
          },
        ],
      };
      col.requests[0].url = "{{baseUrl}}/health";
      col.requests[0].method = "GET";
      setCollections([col]);
      setActiveCollectionId(col.id);
      setActiveRequestId(col.requests[0].id);
      setDraft(col.requests[0]);
    } else {
      setCollections(cols);
      setActiveCollectionId(active.collectionId);
      setActiveRequestId(active.requestId);
      const col = cols.find((c) => c.id === active.collectionId);
      const req = col?.requests.find((r) => r.id === active.requestId);
      if (req) setDraft(req);
    }
    setEnvironments(envs);
    setActiveEnvId(active.envId ?? envs[0]?.id ?? null);
    setHistory(hist.slice(0, 50));
  }, []);

  const activeEnv = useMemo(
    () => environments.find((e) => e.id === activeEnvId) ?? null,
    [environments, activeEnvId],
  );

  const envVars = activeEnv?.variables ?? [];

  const persistCollections = useCallback((next: ApiCollection[]) => {
    setCollections(next);
    saveJson(STORAGE_COLLECTIONS, next);
  }, []);

  const persistEnvironments = useCallback((next: ApiEnvironment[]) => {
    setEnvironments(next);
    saveJson(STORAGE_ENVIRONMENTS, next);
  }, []);

  const persistActive = useCallback(
    (colId: string | null, reqId: string | null, envId: string | null) => {
      saveJson(STORAGE_ACTIVE, { collectionId: colId, requestId: reqId, envId });
    },
    [],
  );

  const patchDraft = (patch: Partial<ApiRequestDoc>) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  const selectRequest = (col: ApiCollection, req: ApiRequestDoc) => {
    setActiveCollectionId(col.id);
    setActiveRequestId(req.id);
    setDraft({ ...req });
    persistActive(col.id, req.id, activeEnvId);
  };

  const saveToCollection = () => {
    if (!activeCollectionId) {
      const col: ApiCollection = { id: newId(), name: "My collection", requests: [{ ...draft, id: draft.id }] };
      persistCollections([...collections, col]);
      setActiveCollectionId(col.id);
      setActiveRequestId(draft.id);
      persistActive(col.id, draft.id, activeEnvId);
      toast.success("Saved to new collection");
      return;
    }
    const next = collections.map((c) => {
      if (c.id !== activeCollectionId) return c;
      const exists = c.requests.some((r) => r.id === draft.id);
      const requests = exists
        ? c.requests.map((r) => (r.id === draft.id ? { ...draft } : r))
        : [...c.requests, { ...draft }];
      return { ...c, requests };
    });
    persistCollections(next);
    toast.success("Request saved");
  };

  const addCollection = () => {
    const col: ApiCollection = { id: newId(), name: `Collection ${collections.length + 1}`, requests: [] };
    persistCollections([...collections, col]);
    setActiveCollectionId(col.id);
  };

  const addRequest = () => {
    const req = createRequest(`Request ${Date.now().toString(36).slice(-4)}`);
    if (!activeCollectionId) {
      addCollection();
      const colId = newId();
      const col: ApiCollection = { id: colId, name: "My collection", requests: [req] };
      persistCollections([...collections, col]);
      setActiveCollectionId(colId);
      selectRequest(col, req);
      return;
    }
    const next = collections.map((c) =>
      c.id === activeCollectionId ? { ...c, requests: [...c.requests, req] } : c,
    );
    persistCollections(next);
    const col = next.find((c) => c.id === activeCollectionId)!;
    selectRequest(col, req);
  };

  const deleteRequest = (colId: string, reqId: string) => {
    const next = collections.map((c) =>
      c.id === colId ? { ...c, requests: c.requests.filter((r) => r.id !== reqId) } : c,
    );
    persistCollections(next);
    if (activeRequestId === reqId) {
      const col = next.find((c) => c.id === colId);
      const first = col?.requests[0];
      if (first && col) selectRequest(col, first);
      else setDraft(createRequest());
    }
  };

  const send = async () => {
    if (!draft.url.trim()) return toast.error("Enter a URL");
    try {
      await flowRun(async () => {
        const payload = buildSendPayload(draft, envVars);
        const res = (await devtoolsApi.apiTest(payload)) as ApiTestResponse;
        setResponse(res);
        setTestResults(runTests(draft.tests, res));
        const entry: HistoryEntry = {
          id: newId(),
          at: Date.now(),
          request: { ...draft },
          status: res.status,
          durationMs: res.durationMs,
        };
        const hist = [entry, ...history].slice(0, 50);
        setHistory(hist);
        saveJson(STORAGE_HISTORY, hist);
        if (res.error) toast.error(res.error);
        else toast.success(`${res.status} ${res.statusText}`);
      }, "Sending HTTP request…");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Request failed");
    }
  };

  const duplicateRequest = () => {
    const copy = { ...draft, id: newId(), name: `${draft.name} (copy)` };
    patchDraft(copy);
    setActiveRequestId(copy.id);
  };

  const exportCollection = () => {
    const col = collections.find((c) => c.id === activeCollectionId);
    if (!col) return toast.error("No collection selected");
    const blob = new Blob([JSON.stringify(col, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${col.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
  };

  const resolvedUrl = applyVariables(draft.url, envVars);

  return (
    <div className="mx-auto max-w-[1600px] space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-black/20 px-3 py-2">
        <Label className="text-xs text-muted-foreground shrink-0">Environment</Label>
        <Select
          value={activeEnvId ?? ""}
          onValueChange={(v) => {
            setActiveEnvId(v);
            persistActive(activeCollectionId, activeRequestId, v);
          }}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="No env" />
          </SelectTrigger>
          <SelectContent>
            {environments.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const env: ApiEnvironment = {
              id: newId(),
              name: `Env ${environments.length + 1}`,
              variables: [emptyRow()],
            };
            persistEnvironments([...environments, env]);
            setActiveEnvId(env.id);
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Env
        </Button>
        {activeEnv ? (
          <span className="text-xs text-muted-foreground truncate max-w-md">
            Use {"{{baseUrl}}"}, {"{{token}}"} in URL / headers / body
          </span>
        ) : null}
      </div>

      {activeEnv ? (
        <div className="rounded-xl border border-border/50 bg-black/15 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Variables — {activeEnv.name}</p>
          <KeyValueEditor
            rows={activeEnv.variables}
            onChange={(variables) => {
              const next = environments.map((e) =>
                e.id === activeEnv.id ? { ...e, variables } : e,
              );
              persistEnvironments(next);
            }}
            placeholders={{ key: "variable", value: "value" }}
          />
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[280px_1fr] min-h-[720px]">
        <div className="rounded-xl border border-border/60 bg-black/25 flex flex-col overflow-hidden">
          <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as "collections" | "history")}>
            <TabsList className="w-full rounded-none border-b border-border/50 bg-transparent h-10">
              <TabsTrigger value="collections" className="flex-1 text-xs">
                <FolderPlus className="h-3.5 w-3.5 mr-1" />
                Collections
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 text-xs">
                <History className="h-3.5 w-3.5 mr-1" />
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="collections" className="m-0 flex-1">
              <div className="p-2 flex gap-1 border-b border-border/40">
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={addCollection}>
                  <FolderPlus className="h-3 w-3 mr-1" />
                  Collection
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={addRequest}>
                  <Plus className="h-3 w-3 mr-1" />
                  Request
                </Button>
              </div>
              <ScrollArea className="h-[560px]">
                <div className="p-2 space-y-3">
                  {collections.map((col) => (
                    <div key={col.id}>
                      <button
                        type="button"
                        className={cn(
                          "w-full text-left text-xs font-semibold px-2 py-1 rounded",
                          activeCollectionId === col.id ? "bg-fuchsia-500/15 text-fuchsia-300" : "text-muted-foreground hover:bg-white/5",
                        )}
                        onClick={() => setActiveCollectionId(col.id)}
                      >
                        {col.name}
                      </button>
                      <div className="mt-1 space-y-0.5 pl-2">
                        {col.requests.map((req) => (
                          <div
                            key={req.id}
                            className={cn(
                              "group flex items-center gap-1 rounded px-2 py-1 text-xs cursor-pointer",
                              activeRequestId === req.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5",
                            )}
                            onClick={() => selectRequest(col, req)}
                          >
                            <span className={cn("font-mono font-bold shrink-0", methodTone(req.method).split(" ")[0])}>
                              {req.method.slice(0, 3)}
                            </span>
                            <span className="truncate flex-1">{req.name}</span>
                            <button
                              type="button"
                              className="opacity-0 group-hover:opacity-100 p-0.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRequest(col.id, req.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="history" className="m-0">
              <ScrollArea className="h-[600px]">
                <div className="p-2 space-y-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">No history yet</p>
                  ) : (
                    history.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        className="w-full text-left rounded-lg border border-border/40 px-2 py-2 hover:bg-white/5 text-xs"
                        onClick={() => setDraft({ ...h.request })}
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-mono font-semibold">{h.request.method}</span>
                          <span className={cn("px-1.5 rounded", statusTone(h.status))}>{h.status || "ERR"}</span>
                        </div>
                        <p className="truncate text-muted-foreground">{h.request.name}</p>
                        <p className="text-[10px] text-muted-foreground">{h.durationMs}ms · {new Date(h.at).toLocaleString()}</p>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="rounded-xl border border-border/60 bg-black/25 flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-border/50 space-y-2">
            <Input
              value={draft.name}
              onChange={(e) => patchDraft({ name: e.target.value })}
              className="h-8 text-sm font-medium bg-transparent border-border/40"
              placeholder="Request name"
            />
            <div className="flex flex-wrap gap-2">
              <Select value={draft.method} onValueChange={(v) => patchDraft({ method: v as HttpMethod })}>
                <SelectTrigger className={cn("w-[120px] h-10 font-bold font-mono border", methodTone(draft.method))}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={draft.url}
                onChange={(e) => patchDraft({ url: e.target.value })}
                className="flex-1 min-w-[200px] h-10 font-mono text-sm"
                placeholder="https://api.example.com/{{path}}"
              />
              <Button disabled={busy} onClick={() => void send()} className="h-10 px-6 bg-fuchsia-600 hover:bg-fuchsia-500">
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send
              </Button>
              <Button variant="outline" className="h-10" onClick={saveToCollection}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10" onClick={duplicateRequest}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10" onClick={exportCollection}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
            {resolvedUrl !== draft.url ? (
              <p className="text-[11px] font-mono text-muted-foreground truncate">→ {resolvedUrl}</p>
            ) : null}
          </div>

          <Tabs defaultValue="params" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-3 mt-2 justify-start flex-wrap h-auto gap-1 bg-transparent">
              {["params", "auth", "headers", "body", "tests"].map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs capitalize data-[state=active]:bg-fuchsia-500/15">
                  {t === "params" ? "Params" : t === "auth" ? "Authorization" : t.charAt(0).toUpperCase() + t.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollArea className="flex-1 max-h-[220px]">
              <TabsContent value="params" className="px-3 pb-3 mt-0">
                <KeyValueEditor rows={draft.params} onChange={(params) => patchDraft({ params })} />
              </TabsContent>
              <TabsContent value="auth" className="px-3 pb-3 mt-0 space-y-3">
                <Select
                  value={draft.auth.type}
                  onValueChange={(v) => patchDraft({ auth: { ...draft.auth, type: v as typeof draft.auth.type } })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                  </SelectContent>
                </Select>
                {draft.auth.type === "bearer" ? (
                  <Input
                    value={draft.auth.token}
                    onChange={(e) => patchDraft({ auth: { ...draft.auth, token: e.target.value } })}
                    placeholder="Bearer token or {{token}}"
                    className="font-mono text-sm"
                  />
                ) : null}
                {draft.auth.type === "basic" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={draft.auth.username}
                      onChange={(e) => patchDraft({ auth: { ...draft.auth, username: e.target.value } })}
                      placeholder="Username"
                    />
                    <Input
                      type="password"
                      value={draft.auth.password}
                      onChange={(e) => patchDraft({ auth: { ...draft.auth, password: e.target.value } })}
                      placeholder="Password"
                    />
                  </div>
                ) : null}
                {draft.auth.type === "apikey" ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={draft.auth.apiKey}
                        onChange={(e) => patchDraft({ auth: { ...draft.auth, apiKey: e.target.value } })}
                        placeholder="Key name"
                      />
                      <Input
                        value={draft.auth.apiValue}
                        onChange={(e) => patchDraft({ auth: { ...draft.auth, apiValue: e.target.value } })}
                        placeholder="Key value"
                      />
                    </div>
                    <Select
                      value={draft.auth.apiIn}
                      onValueChange={(v) =>
                        patchDraft({ auth: { ...draft.auth, apiIn: v as "header" | "query" } })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Add to Header</SelectItem>
                        <SelectItem value="query">Add to Query</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </TabsContent>
              <TabsContent value="headers" className="px-3 pb-3 mt-0">
                <KeyValueEditor rows={draft.headers} onChange={(headers) => patchDraft({ headers })} />
              </TabsContent>
              <TabsContent value="body" className="px-3 pb-3 mt-0 space-y-3">
                <Select value={draft.bodyType} onValueChange={(v) => patchDraft({ bodyType: v as typeof draft.bodyType })}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">none</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="raw">raw</SelectItem>
                    <SelectItem value="form">form-data</SelectItem>
                    <SelectItem value="urlencoded">x-www-form-urlencoded</SelectItem>
                  </SelectContent>
                </Select>
                {draft.bodyType === "json" ? (
                  <Textarea
                    rows={8}
                    value={draft.bodyJson}
                    onChange={(e) => patchDraft({ bodyJson: e.target.value })}
                    className="font-mono text-xs"
                  />
                ) : null}
                {draft.bodyType === "raw" ? (
                  <Textarea
                    rows={8}
                    value={draft.bodyRaw}
                    onChange={(e) => patchDraft({ bodyRaw: e.target.value })}
                    className="font-mono text-xs"
                  />
                ) : null}
                {draft.bodyType === "form" || draft.bodyType === "urlencoded" ? (
                  <KeyValueEditor rows={draft.formRows} onChange={(formRows) => patchDraft({ formRows })} />
                ) : null}
              </TabsContent>
              <TabsContent value="tests" className="px-3 pb-3 mt-0 space-y-2">
                {draft.tests.map((t) => (
                  <div key={t.id} className="grid grid-cols-[28px_120px_1fr_1fr_36px] gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={t.enabled}
                      onChange={(e) =>
                        patchDraft({
                          tests: draft.tests.map((x) =>
                            x.id === t.id ? { ...x, enabled: e.target.checked } : x,
                          ),
                        })
                      }
                      className="accent-fuchsia-500"
                    />
                    <Select
                      value={t.type}
                      onValueChange={(v) =>
                        patchDraft({
                          tests: draft.tests.map((x) =>
                            x.id === t.id ? { ...x, type: v as typeof t.type } : x,
                          ),
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="body_contains">Body contains</SelectItem>
                        <SelectItem value="header">Header equals</SelectItem>
                        <SelectItem value="time_lt">Time &lt; ms</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={t.target}
                      onChange={(e) =>
                        patchDraft({
                          tests: draft.tests.map((x) =>
                            x.id === t.id ? { ...x, target: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder={t.type === "header" ? "Header name" : "—"}
                      className="h-8 text-xs"
                      disabled={t.type !== "header"}
                    />
                    <Input
                      value={t.expected}
                      onChange={(e) =>
                        patchDraft({
                          tests: draft.tests.map((x) =>
                            x.id === t.id ? { ...x, expected: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder="Expected"
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() =>
                        patchDraft({ tests: draft.tests.filter((x) => x.id !== t.id) })
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    patchDraft({
                      tests: [
                        ...draft.tests,
                        { id: newId(), type: "status", target: "", expected: "200", enabled: true },
                      ],
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add test
                </Button>
                {testResults.length > 0 ? (
                  <div className="mt-3 space-y-1 rounded-lg border border-border/40 p-2">
                    {testResults.map((tr) => (
                      <div key={tr.id} className="flex items-center gap-2 text-xs">
                        {tr.passed ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-400" />
                        )}
                        <span className={tr.passed ? "text-emerald-300" : "text-rose-300"}>
                          {tr.label} — {tr.message}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="border-t border-border/50 flex flex-col min-h-[280px]">
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border/40">
              <span className="text-sm font-semibold">Response</span>
              {response ? (
                <>
                  <Badge className={cn("font-mono", statusTone(response.status))}>
                    {response.status} {response.statusText}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{response.durationMs} ms</span>
                  <span className="text-xs text-muted-foreground">
                    {(response.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                  {response.truncated ? (
                    <span className="text-xs text-amber-500">truncated</span>
                  ) : null}
                  {response.error ? (
                    <span className="text-xs text-rose-400">{response.error}</span>
                  ) : null}
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Awaiting request…</span>
              )}
            </div>
            <Tabs value={responseTab} onValueChange={setResponseTab} className="flex-1 flex flex-col">
              <TabsList className="mx-3 mt-1 justify-start bg-transparent h-8">
                <TabsTrigger value="body" className="text-xs">
                  Body
                </TabsTrigger>
                <TabsTrigger value="headers" className="text-xs">
                  Headers
                </TabsTrigger>
                <TabsTrigger value="raw" className="text-xs">
                  Raw
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 h-[200px]">
                <TabsContent value="body" className="px-3 pb-3 mt-0">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground/90 min-h-[120px]">
                    {response
                      ? formatBodyPreview(response.body, response.bodyKind)
                      : "Send a request to see the response"}
                  </pre>
                </TabsContent>
                <TabsContent value="headers" className="px-3 pb-3 mt-0">
                  {response ? (
                    <div className="space-y-1">
                      {Object.entries(response.headers).map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[140px_1fr] gap-2 text-xs font-mono">
                          <span className="text-fuchsia-300/90">{k}</span>
                          <span className="text-muted-foreground break-all">{v}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </TabsContent>
                <TabsContent value="raw" className="px-3 pb-3 mt-0">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {response ? JSON.stringify(response, null, 2) : ""}
                  </pre>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
