/* eslint-disable react-hooks/set-state-in-effect */
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  FileClock,
  FileText,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChatBubble } from "../components/chat-bubble";
import { AppSidebar } from "../components/app-sidebar";
import { RiskBadge } from "../components/risk-badge";
import { UploadZone } from "../components/upload-zone";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../hooks/use-auth";
import { api } from "../lib/api";
import type { DocumentItem } from "../lib/types";

function AppHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-[#060c1c]/70 px-4 py-2.5 shadow-[0_12px_40px_rgba(2,6,23,0.45)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-blue-400/90">Legal workspace</p>
          <p className="text-sm font-semibold text-slate-100">{user?.name ?? "Lawyer"}, welcome back.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/chat">
            <Button variant="secondary" size="sm" className="hidden h-9 rounded-xl border-slate-700/90 bg-[#081020]/80 text-slate-100 hover:bg-slate-800 sm:inline-flex">
              <MessageSquare className="mr-1.5 h-4 w-4 text-blue-400" />
              Open chat
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => logout()} className="h-9 rounded-xl border-slate-700/90 bg-[#081020]/80 px-4 text-xs text-slate-200 hover:bg-slate-800">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#040816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(37,99,235,0.22),transparent_40%),radial-gradient(circle_at_95%_5%,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.1),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.55]" />

      <div className="relative z-10 flex min-h-screen w-full min-w-0">
        <AppSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AppHeader />
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex-1 p-6 lg:p-8">
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [docs, setDocs] = useState<DocumentItem[] | null>(null);
  const [sessionsCount, setSessionsCount] = useState<number | null>(null);

  useEffect(() => {
    void Promise.all([
      api.get<DocumentItem[]>("/documents").then((r) => r.data),
      api.get<unknown[]>("/chat/sessions").then((r) => (Array.isArray(r.data) ? r.data.length : 0)),
    ])
      .then(([docList, count]) => {
        setDocs(docList);
        setSessionsCount(count);
      })
      .catch(() => {
        setDocs([]);
        setSessionsCount(0);
      });
  }, []);

  const stats = useMemo(() => {
    if (!docs)
      return { analyzed: null as number | null, elevatedRisk: null as number | null, avgRisk: null as number | null, sessions: sessionsCount };

    const scores = docs.map((d) => d.risk_score).filter((n): n is number => typeof n === "number" && !Number.isNaN(n));
    const elevatedRisk = docs.filter((d) => typeof d.risk_score === "number" && d.risk_score > 65).length;
    const avgRisk =
      scores.length === 0 ? null : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { analyzed: docs.length, elevatedRisk, avgRisk, sessions: sessionsCount };
  }, [docs, sessionsCount]);

  const statCards = [
    { label: "Contracts in workspace", icon: FileText, tint: "text-sky-300" },
    { label: "Elevated risk items", icon: AlertTriangle, tint: "text-amber-300" },
    { label: "Chat sessions", icon: MessageSquare, tint: "text-violet-300" },
    { label: "Avg. risk score", icon: BarChart3, tint: "text-emerald-300" },
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-blue-900/35 bg-[#071329]/92 p-6 shadow-[0_24px_80px_rgba(37,99,235,0.14)] lg:p-8">
        <div className="pointer-events-none absolute -right-20 top-[-40%] h-56 w-56 rounded-full bg-blue-600/22 blur-[80px]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400/95">Overview</p>
          <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white md:text-4xl">
            Your legal command center
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
            Track contract intelligence, flagged issues, and copilot conversations in one premium workspace aligned with Legalyze&apos;s dashboard experience.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/app/upload">
              <Button className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 shadow-[0_10px_32px_rgba(37,99,235,0.38)]">
                Upload contract
              </Button>
            </Link>
            <Link to="/app/documents">
              <Button variant="secondary" className="h-11 rounded-xl border-slate-700/90 bg-[#081020]/90 text-slate-100 hover:bg-slate-800">
                View documents
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          const showSkeleton = docs === null && item.label !== "Chat sessions";
          const showSessionSkeleton = item.label === "Chat sessions" && sessionsCount === null;
          const display =
            item.label === "Chat sessions"
              ? sessionsCount
              : item.label === "Contracts in workspace"
                ? stats.analyzed
                : item.label === "Elevated risk items"
                  ? stats.elevatedRisk
                  : stats.avgRisk;

          return (
            <Card
              key={item.label}
              className="border-slate-700/90 bg-[#060e1f]/90 p-4 shadow-[0_14px_40px_rgba(2,6,23,0.45)] lg:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.06] bg-[#081326]/90">
                  <Icon className={`h-4 w-4 ${item.tint}`} />
                </span>
              </div>
              {showSkeleton || showSessionSkeleton ? (
                <Skeleton className="mt-4 h-9 w-20 rounded-lg bg-slate-800/80" />
              ) : (
                <p className="mt-4 text-3xl font-bold tabular-nums text-white">{display ?? "—"}</p>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-700/90 p-5 lg:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Recent documents</h2>
          <Link to="/app/documents" className="text-xs font-medium text-blue-400 underline-offset-4 hover:text-blue-300 hover:underline">
            See all →
          </Link>
        </div>
        {!docs ? (
          <Skeleton className="h-28 w-full rounded-xl bg-slate-800/80" />
        ) : docs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700/90 bg-[#080f21]/85 py-12 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-400">No contracts yet.</p>
            <Link to="/app/upload">
              <Button size="sm" className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                Upload your first agreement
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.slice(0, 6).map((d) => (
              <Link
                key={d.id}
                to="/app/documents"
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/85 bg-[#080f21]/82 px-4 py-3 transition hover:border-slate-600 hover:bg-[#0a1428]/95"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-100">{d.file_name}</p>
                  <p className="text-xs text-slate-500">{d.analysis_status}</p>
                </div>
                {d.risk_score != null ? (
                  <RiskBadge severity={d.risk_score > 70 ? "high" : d.risk_score > 40 ? "medium" : "low"} />
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-slate-600">No score</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function ChatPage() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; citations?: { source: string; excerpt: string }[] }[]
  >([]);
  const [sessions, setSessions] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const suggestions = useMemo(
    () => [
      "What is breach of contract under Indian law?",
      "Can employer terminate without notice?",
      "What if landlord breaks rental agreement?",
    ],
    [],
  );

  async function loadSessions() {
    const res = await api.get("/chat/sessions");
    setSessions(res.data);
  }

  async function loadDocs() {
    const res = await api.get<DocumentItem[]>("/documents");
    setDocs(res.data);
  }

  useEffect(() => {
    void loadSessions();
    void loadDocs();
  }, []);

  async function openSession(id: string) {
    setSessionId(id);
    const res = await api.get(`/chat/sessions/${id}`);
    const transformed = (res.data.messages || [])
      .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
      .map(
        (m: { role: "user" | "assistant"; content: string; citations?: { source: string; excerpt: string }[] }) => ({
          role: m.role,
          content: m.content,
          citations: m.citations,
        }),
      );
    setMessages(transformed);
  }

  async function createSession() {
    const create = await api.post("/chat/sessions", {
      title: `Legal chat ${new Date().toLocaleTimeString()}`,
    });
    await loadSessions();
    setSessionId(create.data.id);
    setMessages([]);
  }

  async function uploadInChat() {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    setUploading(true);
    await api.post("/documents/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    setUploading(false);
    setUploadFile(null);
    await loadDocs();
  }

  async function send(content: string) {
    setLoading(true);
    let sid = sessionId;
    if (!sid) {
      const create = await api.post("/chat/sessions", { title: "Legal session" });
      sid = create.data.id;
      setSessionId(sid);
      await loadSessions();
    }
    setMessages((m) => [...m, { role: "user", content }]);
    const res = await api.post(`/chat/sessions/${sid}/messages`, { content });
    setMessages((m) => [...m, { role: "assistant", content: res.data.assistant_message, citations: res.data.citations }]);
    setLoading(false);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const message = String(fd.get("message"));
    await send(message);
    e.currentTarget.reset();
  }

  return (
    <div className="flex gap-3">
      <Card
        className={`overflow-hidden transition-all duration-300 ${
          historyOpen ? "w-full max-w-[290px] border-slate-800 bg-[#070d1c] p-3" : "w-[50px] border-slate-800 bg-[#070d1c] p-2"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          {historyOpen ? <h3 className="text-sm font-semibold">Chat history</h3> : null}
          <Button variant="ghost" size="sm" onClick={() => setHistoryOpen((v) => !v)}>
            {historyOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>
        {historyOpen ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <Button size="sm" onClick={() => void createSession()}>
                <Plus className="mr-1 h-3 w-3" />
                New
              </Button>
            </div>
            <div className="max-h-[50vh] space-y-2 overflow-auto pr-1">
              {sessions.length ? (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => void openSession(s.id)}
                    className={`w-full rounded-lg border p-2 text-left text-xs ${
                      sessionId === s.id
                        ? "border-blue-500 bg-blue-600/10"
                        : "border-slate-700 bg-[#0a1224]"
                    }`}
                  >
                    <p className="font-medium text-slate-100">{s.title}</p>
                    <p className="text-[10px] text-slate-400">{new Date(s.updated_at).toLocaleString()}</p>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-500">No sessions yet.</p>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-dashed border-slate-700 p-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Upload in chat</p>
              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 p-2 text-xs">
                <UploadCloud className="h-4 w-4 text-blue-600" />
                <span className="truncate">{uploadFile?.name ?? "Choose document"}</span>
                <input
                  className="hidden"
                  type="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <Button className="mt-2 w-full" size="sm" onClick={() => void uploadInChat()} disabled={!uploadFile || uploading}>
                {uploading ? "Uploading..." : "Upload for RAG"}
              </Button>
              <p className="mt-2 text-[10px] text-slate-400">Uploaded docs available to chat: {docs.length}</p>
            </div>
          </>
        ) : null}
      </Card>
      <Card className="flex min-h-[78vh] flex-1 flex-col border-slate-800 bg-[#070d1c] p-4">
        <div className="flex-1 overflow-auto pr-1">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center px-4">
              <div className="w-full max-w-2xl text-center">
                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-blue-900/60 bg-blue-950/40 text-blue-400">
                  <Search className="h-4 w-4" />
                </div>
                <h3 className="text-2xl font-semibold">How can I help you today?</h3>
                <p className="mt-1 text-sm text-slate-400">Ask legal questions or choose from suggestions below</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      className="rounded-full border border-slate-700 bg-[#0b1326] px-3 py-1.5 text-xs text-slate-200 hover:border-blue-600"
                      onClick={() => void send(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} role={msg.role} content={msg.content} citations={msg.citations} />
              ))}
              {loading ? <Skeleton className="h-20 w-2/3" /> : null}
            </div>
          )}
        </div>
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <Input name="message" placeholder="Ask legal question..." required />
          <Button type="submit">Send</Button>
        </form>
      </Card>
    </div>
  );
}

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  useEffect(() => {
    api.get<DocumentItem[]>("/documents").then((r) => setDocs(r.data));
  }, []);
  async function upload() {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    await api.post("/documents/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    const updated = await api.get<DocumentItem[]>("/documents");
    setDocs(updated.data);
    setUploading(false);
    setFile(null);
  }
  return (
    <div className="space-y-6">
      <UploadZone onFileSelect={setFile} uploading={uploading} />
      <Button onClick={upload} disabled={!file || uploading}>Upload Contract</Button>
      <Card className="p-5">
        <h3 className="mb-3 text-lg font-semibold">Recent uploads</h3>
        <div className="space-y-2">
          {docs.slice(0, 6).map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-700/85 bg-[#080f21]/50 p-3">
              <p className="text-sm">{d.file_name}</p>
              <span className="text-xs text-slate-500">{d.analysis_status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [clauses, setClauses] = useState<
    { id: string; clause_type: string; content: string; explanation: string; risk_level: "low" | "medium" | "high" }[]
  >([]);
  const [risks, setRisks] = useState<
    {
      severity: "low" | "medium" | "high";
      issue: string;
      recommendation: string;
      clause_type?: string;
      risky_text?: string;
      why_risky?: string;
    }[]
  >([]);
  const [summary, setSummary] = useState<{
    plain_summary: string;
    obligations: string[];
    deadlines: string[];
    payment_terms: string[];
    termination_conditions: string[];
    key_risks: string[];
  } | null>(null);
  useEffect(() => {
    api.get<DocumentItem[]>("/documents").then((r) => setDocs(r.data));
  }, []);
  async function openDoc(id: string) {
    setSelected(id);
    const [c, r, s] = await Promise.all([
      api.get(`/documents/${id}/clauses`),
      api.get(`/documents/${id}/risks`),
      api.get(`/documents/${id}/summary`).catch(() => ({ data: null })),
    ]);
    setClauses(c.data);
    setRisks(r.data);
    setSummary(s.data);
  }
  async function analyze(id: string) {
    await api.post(`/documents/${id}/analyze`);
    await openDoc(id);
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[320px,1fr]">
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">Documents</h3>
        <div className="space-y-2">
          {docs.map((d) => (
            <button key={d.id} className="w-full rounded-xl border p-3 text-left text-sm" onClick={() => void openDoc(d.id)}>
              {d.file_name}
            </button>
          ))}
        </div>
      </Card>
      <div className="space-y-4">
        {!selected ? (
          <Card className="p-8 text-center text-slate-500"><FileClock className="mx-auto mb-2 h-7 w-7" />Select a document to view details.</Card>
        ) : (
          <>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Document Summary</h3>
                <Button onClick={() => void analyze(selected)}>Run Analysis</Button>
              </div>
              {!summary ? (
                <p className="mt-3 text-sm text-slate-500">Run analysis to generate summary insights.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plain language summary</p>
                    <p className="mt-2 text-sm leading-6">{summary.plain_summary}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <p className="text-sm font-semibold">Key obligations</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                        {summary.obligations.length ? summary.obligations.map((i) => <li key={i}>{i}</li>) : <li>Not identified</li>}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <p className="text-sm font-semibold">Deadlines</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                        {summary.deadlines.length ? summary.deadlines.map((i) => <li key={i}>{i}</li>) : <li>Not identified</li>}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <p className="text-sm font-semibold">Payment terms</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                        {summary.payment_terms.length ? summary.payment_terms.map((i) => <li key={i}>{i}</li>) : <li>Not identified</li>}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <p className="text-sm font-semibold">Termination conditions</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                        {summary.termination_conditions.length
                          ? summary.termination_conditions.map((i) => <li key={i}>{i}</li>)
                          : <li>Not identified</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
            <Card className="p-5">
              <h3 className="mb-2 text-lg font-semibold">Extracted Clauses</h3>
              <div className="space-y-3">
                {clauses.length ? (
                  clauses.map((clause) => (
                    <details key={clause.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold">
                        <span className="capitalize">{clause.clause_type.replaceAll("_", " ")}</span>
                        <RiskBadge severity={clause.risk_level} />
                      </summary>
                      <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{clause.content}</p>
                      <p className="mt-2 text-xs text-slate-500">Explanation: {clause.explanation}</p>
                    </details>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No clauses extracted yet.</p>
                )}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="mb-2 text-lg font-semibold">Risk Breakdown</h3>
              <div className="space-y-2">
                {risks.length ? risks.map((r, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <RiskBadge severity={r.severity} />
                    <p className="mt-2 text-sm font-semibold capitalize">
                      {r.issue} {r.clause_type ? `(${r.clause_type.replaceAll("_", " ")})` : ""}
                    </p>
                    {r.risky_text ? (
                      <p className="mt-1 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
                        Risky text: "{r.risky_text}"
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Why risky: {r.why_risky ?? r.issue}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Safer alternative: {r.recommendation}</p>
                  </div>
                )) : <p className="text-sm text-slate-500">No explicit risks identified yet.</p>}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export function AnalysisPage() {
  return (
    <div className="space-y-4">
      <Card className="p-5"><h2 className="text-xl font-semibold">Contract Analysis Intelligence</h2><p className="mt-2 text-sm text-slate-500">Use the Documents section for full tabs, clause viewer, risk timeline, and recommendation workflow.</p></Card>
    </div>
  );
}

export function ProfilePage() {
  const { user, setUser } = useAuth();
  async function update(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await api.patch("/users/me", { name: String(fd.get("name")) });
    setUser(res.data);
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <h3 className="text-lg font-semibold">Profile info</h3>
        <form onSubmit={update} className="mt-3 space-y-3">
          <Input defaultValue={user?.name} name="name" />
          <Input defaultValue={user?.email} disabled />
          <Button type="submit">Save Profile</Button>
        </form>
      </Card>
      <Card className="p-5">
        <h3 className="text-lg font-semibold">Activity history</h3>
        <p className="mt-2 text-sm text-slate-500">Saved chats and document activity are listed in dashboard and documents.</p>
      </Card>
    </div>
  );
}

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  created_at: string;
};

function timeAgo(iso: string): string {
  // Treat timestamps without a timezone marker as UTC (backend stores UTC).
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const then = new Date(normalized).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  if (diff < 0) return "just now";
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(normalized).toLocaleDateString();
}

function notificationIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("upload")) return UploadCloud;
  if (t.includes("complete") || t.includes("analysis") || t.includes("success")) return CheckCircle2;
  if (t.includes("risk") || t.includes("fail") || t.includes("error")) return AlertTriangle;
  return Bell;
}

type SearchResults = {
  documents: { id: string; file_name: string }[];
  chats: { id: string; title: string }[];
  clauses: { id: string; document_id: string; clause_type: string }[];
  risks: { id: string; severity: "low" | "medium" | "high"; issue: string }[];
};

export function SettingsPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  useEffect(() => {
    api.get<NotificationItem[]>("/notifications").then((r) => setNotifications(r.data));
  }, []);
  async function searchAll() {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<SearchResults>("/search", { params: { q } });
      setResults(res.data);
    } finally {
      setSearching(false);
    }
  }
  const totalResults = results
    ? results.documents.length + results.chats.length + results.clauses.length + results.risks.length
    : 0;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <h3 className="mb-3 text-lg font-semibold">Global Search</h3>
        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void searchAll();
            }}
            placeholder="Search chats, clauses, risks..."
          />
          <Button onClick={searchAll} disabled={searching || !q.trim()}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {results === null ? (
          <p className="mt-4 text-sm text-slate-500">Search across your documents, chats, clauses, and risks.</p>
        ) : totalResults === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No results for "{q}".</p>
        ) : (
          <div className="mt-4 space-y-4">
            {results.documents.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <FileText className="h-3.5 w-3.5" /> Documents ({results.documents.length})
                </p>
                <ul className="space-y-1.5">
                  {results.documents.map((d) => (
                    <li key={d.id} className="rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700">
                      {d.file_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.chats.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <MessageSquare className="h-3.5 w-3.5" /> Chats ({results.chats.length})
                </p>
                <ul className="space-y-1.5">
                  {results.chats.map((c) => (
                    <li key={c.id} className="rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700">
                      {c.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.clauses.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <BarChart3 className="h-3.5 w-3.5" /> Clauses ({results.clauses.length})
                </p>
                <ul className="space-y-1.5">
                  {results.clauses.map((c) => (
                    <li key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-sm capitalize dark:border-slate-700">
                      <span>{c.clause_type.replace(/_/g, " ")}</span>
                      <span className="text-xs text-slate-500">doc: {c.document_id.slice(-6)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.risks.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <AlertTriangle className="h-3.5 w-3.5" /> Risks ({results.risks.length})
                </p>
                <ul className="space-y-1.5">
                  {results.risks.map((r) => (
                    <li key={r.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700">
                      <span className="min-w-0 flex-1 truncate">{r.issue}</span>
                      <RiskBadge severity={r.severity} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Bell className="h-4 w-4" />Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => {
              const Icon = notificationIcon(n.title);
              return (
                <li
                  key={n.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40"
                >
                  <span className="shrink-0 rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{n.title}</p>
                      <span className="shrink-0 text-xs text-slate-500">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="mt-0.5 break-words text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
