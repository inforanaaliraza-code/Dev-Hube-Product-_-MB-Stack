"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ApiError } from "@/lib/api";
import {
  createMailbox,
  deleteMailbox,
  fetchDomains,
  fetchMailbox,
  fetchMessage,
  getStoredMailboxId,
  getWorkerHealth,
  listMessages,
  setStoredMailboxId,
  type CreateMailboxOptions,
  type TempMailbox,
  type TempMessageDetail,
  type TempMessageSummary,
} from "@/lib/temp-mail-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const POLL_MS = 8000;
const WORKER_HEALTH_MS = 60000;
const RANDOM_DOMAIN = "__random__";

function splitAddress(address: string) {
  const at = address.lastIndexOf("@");
  if (at <= 0) {
    return { local: "", domain: "" };
  }
  return { local: address.slice(0, at), domain: address.slice(at + 1) };
}

export function TempMailTool() {
  const [mailbox, setMailbox] = useState<TempMailbox | null>(null);
  const [messages, setMessages] = useState<TempMessageSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TempMessageDetail | null>(null);
  const [workerHealthy, setWorkerHealthy] = useState<boolean | null>(null);
  const [closing, setClosing] = useState(false);
  const [booting, setBooting] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [customLocalName, setCustomLocalName] = useState("");
  const pollInFlightRef = useRef(false);
  const domainsRef = useRef<string[]>([]);
  const selectedDomainRef = useRef("");
  const customLocalNameRef = useRef("");

  domainsRef.current = domains;
  selectedDomainRef.current = selectedDomain;
  customLocalNameRef.current = customLocalName;

  const applyAddressPrefs = (address: string) => {
    const { local, domain } = splitAddress(address);
    setCustomLocalName(local);
    setSelectedDomain(domain);
  };

  const buildCreateOptions = (): CreateMailboxOptions => {
    const options: CreateMailboxOptions = {};
    const domain = selectedDomainRef.current;
    const localPart = customLocalNameRef.current.trim();
    if (domain) {
      options.domain = domain;
    }
    if (localPart) {
      options.localPart = localPart;
    }
    return options;
  };

  const clearCurrentMailbox = useCallback(() => {
    setStoredMailboxId(null);
    setMailbox(null);
    setMessages([]);
    setSelectedId(null);
    setDetail(null);
  }, []);

  const checkWorkerHealth = useCallback(async () => {
    try {
      const health = await getWorkerHealth();
      setWorkerHealthy(health.ok);
    } catch {
      setWorkerHealthy(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (mailboxId: string, silent = false) => {
      if (silent && pollInFlightRef.current) {
        return [];
      }
      if (silent) {
        pollInFlightRef.current = true;
      }
      if (!silent) setRefreshing(true);
      try {
        const items = await listMessages(mailboxId);
        setMessages(items);
        return items;
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          clearCurrentMailbox();
          if (!silent) {
            toast.info("Inbox expired. Create a new inbox when ready.");
          }
          return [];
        }
        if (!silent) {
          toast.error(e instanceof Error ? e.message : "Could not load inbox");
        }
        return [];
      } finally {
        if (silent) {
          pollInFlightRef.current = false;
        }
        if (!silent) setRefreshing(false);
      }
    },
    [clearCurrentMailbox],
  );

  const bootstrap = useCallback(async () => {
    setBooting(true);
    setDetail(null);
    setSelectedId(null);
    try {
      const stored = getStoredMailboxId();
      if (stored) {
        try {
          const existing = await fetchMailbox(stored);
          setMailbox(existing);
          applyAddressPrefs(existing.address);
          setBooting(false);
          await loadMessages(existing.id, true);
          return;
        } catch (e) {
          if (!(e instanceof ApiError) || e.status !== 404) {
            throw e;
          }
          setStoredMailboxId(null);
        }
      }
      setBooting(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start temp mail");
    } finally {
      setBooting(false);
    }
  }, [loadMessages]);

  const createInbox = useCallback(async () => {
    setBooting(true);
    setDetail(null);
    setSelectedId(null);
    try {
      const created = await createMailbox(buildCreateOptions());
      setStoredMailboxId(created.id);
      setMailbox(created);
      applyAddressPrefs(created.address);
      await loadMessages(created.id, true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create inbox");
    } finally {
      setBooting(false);
    }
  }, [loadMessages]);

  const handleNewAddress = useCallback(async () => {
    setCreating(true);
    try {
      if (mailbox) {
        try {
          await deleteMailbox(mailbox.id);
        } catch {
        }
      }
      const created = await createMailbox(buildCreateOptions());
      setStoredMailboxId(created.id);
      setMailbox(created);
      applyAddressPrefs(created.address);
      setMessages([]);
      setSelectedId(null);
      setDetail(null);
      await loadMessages(created.id, true);
      toast.success("New address ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create address");
    } finally {
      setCreating(false);
    }
  }, [loadMessages, mailbox]);

  const handleCloseInbox = useCallback(async () => {
    if (!mailbox) return;
    setClosing(true);
    try {
      await deleteMailbox(mailbox.id).catch(() => {});
      clearCurrentMailbox();
      toast.success("Inbox closed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not close inbox");
    } finally {
      setClosing(false);
    }
  }, [clearCurrentMailbox, mailbox]);

  const bootstrapRef = useRef(bootstrap);
  bootstrapRef.current = bootstrap;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setDomainsLoading(true);
      try {
        const list = await fetchDomains();
        if (!cancelled) {
          setDomains(list.map((d) => d.domain).sort());
        }
      } catch {
        if (!cancelled) {
          setDomains([]);
        }
      } finally {
        if (!cancelled) {
          setDomainsLoading(false);
        }
      }
    })();
    void checkWorkerHealth();
    const healthTimer = setInterval(() => {
      void checkWorkerHealth();
    }, WORKER_HEALTH_MS);
    void bootstrapRef.current();
    return () => {
      cancelled = true;
      clearInterval(healthTimer);
    };
  }, [checkWorkerHealth]);

  const mailboxId = mailbox?.id;

  useEffect(() => {
    if (!mailboxId) return;
    const tick = () => {
      void loadMessages(mailboxId, true);
    };
    const timer = setInterval(tick, POLL_MS);
    return () => clearInterval(timer);
  }, [mailboxId, loadMessages]);

  useEffect(() => {
    if (!mailbox || !selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void fetchMessage(mailbox.id, selectedId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Could not load message");
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mailbox, selectedId]);

  const copyAddress = async () => {
    if (!mailbox) return;
    await navigator.clipboard.writeText(mailbox.address);
    toast.success("Address copied");
  };

  const copyOtp = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };

  const expiresLabel = mailbox
    ? formatDistanceToNow(new Date(mailbox.expiresAt), { addSuffix: true })
    : "";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Card className={cn(glassCard, "overflow-hidden")}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-400" />
                Your address
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Use this email for signups and OTPs. Inbox refreshes automatically.
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mailbox && !booting ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Your name</label>
                  <Input
                    value={customLocalName}
                    onChange={(e) => setCustomLocalName(e.target.value)}
                    placeholder="john.smith"
                    className="font-mono text-sm bg-secondary/40"
                    autoComplete="off"
                  />
                </div>
                <span className="hidden sm:block pb-2 text-center text-muted-foreground font-medium">
                  @
                </span>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Domain</label>
                  <Select
                    value={selectedDomain || RANDOM_DOMAIN}
                    onValueChange={(v) => setSelectedDomain(v === RANDOM_DOMAIN ? "" : v)}
                    disabled={domainsLoading}
                  >
                    <SelectTrigger className="bg-secondary/40 font-mono text-sm">
                      <SelectValue placeholder={domainsLoading ? "Loading…" : "Random domain"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RANDOM_DOMAIN}>Random domain</SelectItem>
                      {domains.map((d) => (
                        <SelectItem key={d} value={d}>
                          @{d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Real @gmail.com is not supported. Leave name empty for a random one.
              </p>
              <Button type="button" className="w-full sm:w-auto" onClick={() => void createInbox()}>
                <Mail className="h-4 w-4 mr-1.5" />
                Create inbox
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Your name</label>
                  <Input
                    value={customLocalName}
                    onChange={(e) => setCustomLocalName(e.target.value)}
                    placeholder="john.smith"
                    className="font-mono text-sm bg-secondary/40"
                    autoComplete="off"
                    disabled={booting || creating}
                  />
                </div>
                <span className="hidden sm:block pb-2 text-center text-muted-foreground font-medium">
                  @
                </span>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Domain</label>
                  <Select
                    value={selectedDomain || RANDOM_DOMAIN}
                    onValueChange={(v) => setSelectedDomain(v === RANDOM_DOMAIN ? "" : v)}
                    disabled={domainsLoading || booting || creating}
                  >
                    <SelectTrigger className="bg-secondary/40 font-mono text-sm">
                      <SelectValue placeholder={domainsLoading ? "Loading…" : "Random domain"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RANDOM_DOMAIN}>Random domain</SelectItem>
                      {domains.map((d) => (
                        <SelectItem key={d} value={d}>
                          @{d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Edit name/domain then tap New address. @gmail.com is not available.
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={booting ? "Creating your address…" : mailbox?.address ?? ""}
                  className="font-mono text-sm bg-secondary/40"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!mailbox || booting}
                  onClick={() => void copyAddress()}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={refreshing || !mailbox || booting}
                  onClick={() => mailbox && void loadMessages(mailbox.id)}
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                  )}
                  Refresh
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={creating || booting}
                  onClick={() => void handleNewAddress()}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1.5" />
                  )}
                  New address
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!mailbox || closing || booting}
                  onClick={() => void handleCloseInbox()}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Close inbox
                </Button>
              </div>
              {mailbox && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Expires {expiresLabel}. Messages are not stored permanently on Dev Hube.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {workerHealthy === true ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Worker online
                      </Badge>
                    ) : workerHealthy === false ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Worker offline
                      </Badge>
                    ) : null}
                    {workerHealthy === false ? (
                      <p className="text-[11px] text-amber-400/90 w-full">
                        Inbox still works. Start Python: Services\temp-mail → uvicorn main:app --port 8100
                      </p>
                    ) : null}
                    {workerHealthy === null ? (
                      <Badge variant="outline" className="text-[10px]">
                        Checking worker
                      </Badge>
                    ) : null}
                  </div>
                </>
              )}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Inbox className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Inbox</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {messages.length}
                  </Badge>
                </div>
                <ScrollArea className="h-[min(420px,50vh)] pr-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      Waiting for mail… Send a test to your address above.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {messages.map((m) => (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(m.id)}
                            className={cn(
                              "w-full text-left rounded-xl border border-border p-3 transition-colors hover:bg-secondary/50",
                              selectedId === m.id && "bg-secondary/60 ring-1 ring-emerald-500/40",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium line-clamp-1">{m.subject}</span>
                              {m.otpCode && (
                                <Badge className="shrink-0 bg-emerald-600/90 hover:bg-emerald-600/90 font-mono">
                                  {m.otpCode}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{m.from}</p>
                            <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{m.intro}</p>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(m.receivedAt), { addSuffix: true })}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className={cn(glassCard, "overflow-hidden min-h-[min(520px,70vh)]")}>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl">Message</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedId ? (
            <p className="text-sm text-muted-foreground py-16 text-center">
              Select a message to read it here.
            </p>
          ) : detailLoading && !detail ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading…</span>
            </div>
          ) : detail ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{detail.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">{detail.from}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(detail.receivedAt), { addSuffix: true })}
                </p>
              </div>
              {detail.otpCodes.length > 0 && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-emerald-300/90 mb-2">
                    Detected codes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detail.otpCodes.map((code) => (
                      <Button
                        key={code}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="font-mono text-base"
                        onClick={() => void copyOtp(code)}
                      >
                        {code}
                        <Copy className="h-3.5 w-3.5 ml-2 opacity-70" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {detail.sanitizedHtml ? (
                <div
                  className="prose prose-invert prose-sm max-w-none rounded-xl border border-border p-4 bg-background/40 overflow-auto max-h-[min(360px,45vh)]"
                  dangerouslySetInnerHTML={{ __html: detail.sanitizedHtml }}
                />
              ) : (
                <pre className="text-sm whitespace-pre-wrap rounded-xl border border-border p-4 bg-background/40 overflow-auto max-h-[min(360px,45vh)]">
                  {detail.text || detail.intro || "Empty message"}
                </pre>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setSelectedId(null);
                  setDetail(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Close
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
