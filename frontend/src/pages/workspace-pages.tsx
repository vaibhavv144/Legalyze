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
  Trash2,
  UploadCloud,
  Menu,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChatBubble } from "../components/chat-bubble";
import { AppSidebar } from "../components/app-sidebar";
import { AppMobileNav } from "../components/app-mobile-nav";
import { RiskBadge } from "../components/risk-badge";
import { UploadZone } from "../components/upload-zone";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../hooks/use-auth";
import { api } from "../lib/api";
import type { DocumentItem } from "../lib/types";

const eyebrow = "font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a39a]";
const sectionTitle = "text-lg font-semibold tracking-tight text-[#161513]";

function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e6e1] bg-[#fbfbfa]/85 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-[#161513] transition-colors hover:bg-[#f1efea] lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="min-w-0">
            <p className={eyebrow}>Legal workspace</p>
            <p className="mt-1 truncate text-sm font-semibold text-[#161513]">
              {user?.name ?? "Welcome"}, welcome back.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/app/chat" className="hidden sm:block">
            <Button variant="secondary" size="sm">
              <MessageSquare className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
              Open chat
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fbfbfa] text-[#3a3a37]">
      <AppSidebar />
      <AppMobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={() => setMobileNavOpen(true)} />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.main>
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
    { label: "Contracts in workspace", icon: FileText },
    { label: "Elevated risk items", icon: AlertTriangle },
    { label: "Chat sessions", icon: MessageSquare },
    { label: "Avg. risk score", icon: BarChart3 },
  ] as const;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <Card className="relative overflow-hidden p-7 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-[#f4f2ed]"
        />
        <div className="relative">
          <p className={eyebrow}>Overview</p>
          <h1 className="mt-3 font-serif text-3xl font-medium tracking-[-0.02em] text-[#0c0b0a] md:text-4xl">
            Your legal command center
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#5b574f]">
            Track contract intelligence, flagged issues, and copilot conversations in one calm workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app/upload">
              <Button size="lg">Upload contract</Button>
            </Link>
            <Link to="/app/documents">
              <Button variant="secondary" size="lg">View documents</Button>
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
            <Card key={item.label} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <p className={eyebrow}>{item.label}</p>
                <span className="grid h-9 w-9 place-items-center rounded-md border border-[#e8e6e1] bg-[#fbfbfa] text-[#161513]">
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </span>
              </div>
              {showSkeleton || showSessionSkeleton ? (
                <Skeleton className="mt-4 h-9 w-20" />
              ) : (
                <p className="mt-4 font-mono text-3xl font-medium tabular-nums text-[#0c0b0a]">
                  {display ?? "—"}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className={sectionTitle}>Recent documents</h2>
          <Link
            to="/app/documents"
            className="text-xs font-semibold text-[#0c0b0a] underline-offset-4 hover:underline"
          >
            See all →
          </Link>
        </div>
        {!docs ? (
          <Skeleton className="h-28 w-full" />
        ) : docs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d6d3cc] bg-[#fcfbf9] py-12 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-[#c4bdb1]" strokeWidth={1.5} />
            <p className="text-sm text-[#78736b]">No contracts yet.</p>
            <Link to="/app/upload">
              <Button size="sm" className="mt-4">Upload your first agreement</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.slice(0, 6).map((d) => (
              <Link
                key={d.id}
                to="/app/documents"
                className="flex items-center justify-between gap-4 rounded-lg border border-[#e8e6e1] bg-[#fcfbf9] px-4 py-3 transition-colors hover:border-[#d6d3cc] hover:bg-white"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#161513]">{d.file_name}</p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#a8a39a]">
                    {d.analysis_status}
                  </p>
                </div>
                {d.risk_score != null ? (
                  <RiskBadge severity={d.risk_score > 70 ? "high" : d.risk_score > 40 ? "medium" : "low"} />
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#b3aea5]">
                    No score
                  </span>
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
  const [historyOpen, setHistoryOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [loading, setLoading] = useState(false);
  const suggestions = useMemo(
    () => [
      "What is breach of contract under Indian law?",
      "Can an employer terminate without notice?",
      "What if a landlord breaks a rental agreement?",
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
    const form = e.currentTarget;
    const fd = new FormData(form);
    const message = String(fd.get("message")).trim();
    if (!message) return;
    form.reset();
    await send(message);
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 lg:flex-row">
      <Card
        className={`shrink-0 overflow-hidden bg-[#f7f6f3] transition-all duration-300 ${
          historyOpen ? "w-full max-w-none p-3 lg:max-w-[290px]" : "w-full max-w-[52px] p-2 lg:w-[52px]"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          {historyOpen ? <h3 className="text-sm font-semibold text-[#161513]">Chat history</h3> : null}
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={() => setHistoryOpen((v) => !v)}>
            {historyOpen ? <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} /> : <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />}
          </Button>
        </div>
        {historyOpen ? (
          <>
            <div className="mb-3">
              <Button size="sm" className="w-full" onClick={() => void createSession()}>
                <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
                New chat
              </Button>
            </div>
            <div className="max-h-[50vh] space-y-2 overflow-auto pr-1">
              {sessions.length ? (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => void openSession(s.id)}
                    className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                      sessionId === s.id
                        ? "border-[#0c0b0a] bg-white"
                        : "border-[#e8e6e1] bg-white hover:border-[#d6d3cc]"
                    }`}
                  >
                    <p className="truncate text-xs font-medium text-[#161513]">{s.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#a8a39a]">
                      {new Date(s.updated_at).toLocaleString()}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-xs text-[#78736b]">No sessions yet.</p>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-dashed border-[#d6d3cc] p-3">
              <p className={eyebrow}>Upload in chat</p>
              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-md border border-[#e8e6e1] bg-white p-2 text-xs text-[#3a3a37]">
                <UploadCloud className="h-4 w-4 text-[#161513]" strokeWidth={1.75} />
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
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#a8a39a]">
                Docs available: {docs.length}
              </p>
            </div>
          </>
        ) : null}
      </Card>

      <Card className="flex min-h-[78vh] flex-1 flex-col p-4">
        <div className="flex-1 overflow-auto pr-1">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center px-4">
              <div className="w-full max-w-2xl text-center">
                <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-md border border-[#e8e6e1] bg-[#fbfbfa] text-[#161513]">
                  <Search className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <h3 className="font-serif text-2xl font-medium tracking-[-0.01em] text-[#0c0b0a]">
                  How can I help you today?
                </h3>
                <p className="mt-2 text-sm text-[#78736b]">
                  Ask a legal question or pick a suggestion below.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      className="rounded-full border border-[#e8e6e1] bg-[#fcfbf9] px-3.5 py-1.5 text-xs text-[#3a3a37] transition-colors hover:border-[#0c0b0a] hover:bg-white"
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
          <Input name="message" placeholder="Ask a legal question..." required />
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
  async function deleteDoc(id: string) {
    if (!window.confirm("Delete this document and its analysis? This cannot be undone.")) return;
    await api.delete(`/documents/${id}`);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }
  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <p className={eyebrow}>Upload</p>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-[-0.02em] text-[#0c0b0a]">
          Add a contract
        </h1>
      </div>
      <UploadZone onFileSelect={setFile} uploading={uploading} />
      <Button onClick={upload} disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload contract"}
      </Button>
      <Card className="p-6">
        <h3 className={`mb-4 ${sectionTitle}`}>Recent uploads</h3>
        {docs.length === 0 ? (
          <p className="text-sm text-[#78736b]">Nothing uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {docs.slice(0, 6).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#e8e6e1] bg-[#fcfbf9] px-4 py-3"
              >
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#161513]">{d.file_name}</p>
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-[#a8a39a]">
                  {d.analysis_status}
                </span>
                <button
                  aria-label={`Delete ${d.file_name}`}
                  title="Delete document"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#a8a39a] transition-colors hover:bg-[#f3e9e7] hover:text-[#9f2f2d]"
                  onClick={() => void deleteDoc(d.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [clauses, setClauses] = useState<
    {
      id: string;
      clause_type: string;
      content: string;
      explanation: string;
      risk_level: "low" | "medium" | "high" | "critical";
    }[]
  >([]);
  const [risks, setRisks] = useState<
    {
      severity: "low" | "medium" | "high" | "critical";
      issue: string;
      recommendation: string;
      clause_type?: string;
      risky_text?: string;
      why_risky?: string;
    }[]
  >([]);
  const [summary, setSummary] = useState<{
    contract_type?: string | null;
    overall_risk_level?: string | null;
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
    setAnalyzing(true);
    try {
      await api.post(`/documents/${id}/analyze`);
      await openDoc(id);
    } finally {
      setAnalyzing(false);
    }
  }
  async function deleteDoc(id: string) {
    if (!window.confirm("Delete this document and its analysis? This cannot be undone.")) return;
    await api.delete(`/documents/${id}`);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (selected === id) {
      setSelected("");
      setClauses([]);
      setRisks([]);
      setSummary(null);
    }
  }

  const summaryGroups = summary
    ? ([
        ["Key obligations", summary.obligations],
        ["Deadlines", summary.deadlines],
        ["Payment terms", summary.payment_terms],
        ["Termination conditions", summary.termination_conditions],
      ] as const)
    : [];

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4 xl:grid-cols-[320px,1fr]">
      <Card className="p-4">
        <h3 className={`mb-3 ${sectionTitle}`}>Documents</h3>
        {docs.length === 0 ? (
          <p className="text-sm text-[#78736b]">No documents yet.</p>
        ) : (
          <div className="space-y-2">
            {docs.map((d) => (
              <div
                key={d.id}
                className={`group flex items-center gap-1 rounded-lg border pr-1 transition-colors ${
                  selected === d.id
                    ? "border-[#0c0b0a] bg-white"
                    : "border-[#e8e6e1] bg-[#fcfbf9] hover:border-[#d6d3cc] hover:bg-white"
                }`}
              >
                <button
                  className={`min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm ${
                    selected === d.id ? "font-medium text-[#161513]" : "text-[#3a3a37]"
                  }`}
                  onClick={() => void openDoc(d.id)}
                >
                  {d.file_name}
                </button>
                <button
                  aria-label={`Delete ${d.file_name}`}
                  title="Delete document"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#a8a39a] transition-colors hover:bg-[#f3e9e7] hover:text-[#9f2f2d]"
                  onClick={() => void deleteDoc(d.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <div className="space-y-4">
        {!selected ? (
          <Card className="p-10 text-center">
            <FileClock className="mx-auto mb-3 h-8 w-8 text-[#c4bdb1]" strokeWidth={1.5} />
            <p className="text-sm text-[#78736b]">Select a document to view details.</p>
          </Card>
        ) : (
          <>
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className={sectionTitle}>Document summary</h3>
                  {summary?.contract_type ? (
                    <span className="rounded-full border border-[#e8e6e1] bg-[#fcfbf9] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-[#3a3a37]">
                      {summary.contract_type}
                    </span>
                  ) : null}
                  {summary?.overall_risk_level ? (
                    <RiskBadge
                      severity={
                        (summary.overall_risk_level.toLowerCase() === "moderate"
                          ? "medium"
                          : summary.overall_risk_level.toLowerCase()) as "low" | "medium" | "high" | "critical"
                      }
                    />
                  ) : null}
                </div>
                <Button onClick={() => void analyze(selected)} disabled={analyzing}>
                  {analyzing ? "Analyzing..." : "Run analysis"}
                </Button>
              </div>
              {analyzing ? (
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              ) : !summary ? (
                <p className="mt-3 text-sm text-[#78736b]">Run analysis to generate summary insights.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-lg border border-[#eeece7] bg-[#fcfbf9] p-4">
                    <p className={eyebrow}>Plain-language summary</p>
                    <p className="mt-2 text-sm leading-6 text-[#3a3a37]">{summary.plain_summary}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {summaryGroups.map(([label, items]) => (
                      <div key={label} className="rounded-lg border border-[#e8e6e1] p-4">
                        <p className="text-sm font-semibold text-[#161513]">{label}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#6b665d]">
                          {items.length ? items.map((i) => <li key={i}>{i}</li>) : <li>Not identified</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {summary.key_risks.length ? (
                    <div className="rounded-lg border border-[#f1ddd9] bg-[#fdf6f5] p-4">
                      <p className="text-sm font-semibold text-[#9f2f2d]">Key risks</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#7a4a46]">
                        {summary.key_risks.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className={`mb-3 ${sectionTitle}`}>Extracted clauses</h3>
              <div className="space-y-3">
                {clauses.length ? (
                  clauses.map((clause) => (
                    <details key={clause.id} className="rounded-lg border border-[#e8e6e1] p-4">
                      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-[#161513]">
                        <span className="capitalize">{clause.clause_type.replaceAll("_", " ")}</span>
                        <RiskBadge severity={clause.risk_level} />
                      </summary>
                      <p className="mt-3 text-sm leading-6 text-[#3a3a37]">{clause.content}</p>
                      <p className="mt-2 text-xs text-[#78736b]">Explanation: {clause.explanation}</p>
                    </details>
                  ))
                ) : (
                  <p className="text-sm text-[#78736b]">No clauses extracted yet.</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className={`mb-3 ${sectionTitle}`}>Risk breakdown</h3>
              <div className="space-y-2.5">
                {risks.length ? (
                  risks.map((r, i) => (
                    <div key={i} className="rounded-lg border border-[#e8e6e1] p-4">
                      <RiskBadge severity={r.severity} />
                      <p className="mt-2.5 text-sm font-semibold capitalize text-[#161513]">
                        {r.issue} {r.clause_type ? `(${r.clause_type.replaceAll("_", " ")})` : ""}
                      </p>
                      {r.risky_text ? (
                        <p className="mt-2 rounded-md border border-[#f4d9d7] bg-[#fbeae9] p-2 text-xs text-[#9f2f2d]">
                          Risky text: "{r.risky_text}"
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-[#3a3a37]">Why risky: {r.why_risky ?? r.issue}</p>
                      <p className="mt-1 text-xs text-[#78736b]">Safer alternative: {r.recommendation}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#78736b]">No explicit risks identified yet.</p>
                )}
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
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Card className="p-6">
        <h2 className="font-serif text-2xl font-medium tracking-[-0.02em] text-[#0c0b0a]">
          Contract analysis intelligence
        </h2>
        <p className="mt-2 text-sm text-[#78736b]">
          Use the Documents section for the full clause viewer, risk breakdown, and recommendation workflow.
        </p>
      </Card>
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
    <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2">
      <Card className="p-6">
        <h3 className={sectionTitle}>Profile info</h3>
        <form onSubmit={update} className="mt-4 space-y-3">
          <Input defaultValue={user?.name} name="name" />
          <Input defaultValue={user?.email} disabled />
          <Button type="submit">Save profile</Button>
        </form>
      </Card>
      <Card className="p-6">
        <h3 className={sectionTitle}>Activity history</h3>
        <p className="mt-2 text-sm text-[#78736b]">
          Saved chats and document activity appear in the dashboard and documents sections.
        </p>
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
    <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2">
      <Card className="p-6">
        <h3 className={`mb-4 ${sectionTitle}`}>Global search</h3>
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
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
        {results === null ? (
          <p className="mt-4 text-sm text-[#78736b]">
            Search across your documents, chats, clauses, and risks.
          </p>
        ) : totalResults === 0 ? (
          <p className="mt-4 text-sm text-[#78736b]">No results for "{q}".</p>
        ) : (
          <div className="mt-5 space-y-5">
            {results.documents.length > 0 && (
              <div>
                <p className={`mb-2 flex items-center gap-2 ${eyebrow}`}>
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.75} /> Documents ({results.documents.length})
                </p>
                <ul className="space-y-1.5">
                  {results.documents.map((d) => (
                    <li key={d.id} className="rounded-md border border-[#e8e6e1] bg-[#fcfbf9] p-2.5 text-sm text-[#3a3a37]">
                      {d.file_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.chats.length > 0 && (
              <div>
                <p className={`mb-2 flex items-center gap-2 ${eyebrow}`}>
                  <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} /> Chats ({results.chats.length})
                </p>
                <ul className="space-y-1.5">
                  {results.chats.map((c) => (
                    <li key={c.id} className="rounded-md border border-[#e8e6e1] bg-[#fcfbf9] p-2.5 text-sm text-[#3a3a37]">
                      {c.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.clauses.length > 0 && (
              <div>
                <p className={`mb-2 flex items-center gap-2 ${eyebrow}`}>
                  <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.75} /> Clauses ({results.clauses.length})
                </p>
                <ul className="space-y-1.5">
                  {results.clauses.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-md border border-[#e8e6e1] bg-[#fcfbf9] p-2.5 text-sm capitalize text-[#3a3a37]"
                    >
                      <span>{c.clause_type.replace(/_/g, " ")}</span>
                      <span className="font-mono text-[11px] text-[#a8a39a]">doc: {c.document_id.slice(-6)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.risks.length > 0 && (
              <div>
                <p className={`mb-2 flex items-center gap-2 ${eyebrow}`}>
                  <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} /> Risks ({results.risks.length})
                </p>
                <ul className="space-y-1.5">
                  {results.risks.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-start justify-between gap-2 rounded-md border border-[#e8e6e1] bg-[#fcfbf9] p-2.5 text-sm text-[#3a3a37]"
                    >
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
      <Card className="p-6">
        <h3 className={`mb-4 flex items-center gap-2 ${sectionTitle}`}>
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          Notifications
        </h3>
        {notifications.length === 0 ? (
          <p className="text-sm text-[#78736b]">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => {
              const Icon = notificationIcon(n.title);
              return (
                <li
                  key={n.id}
                  className="flex items-start gap-3 rounded-lg border border-[#e8e6e1] bg-[#fcfbf9] p-3 transition-colors hover:border-[#d6d3cc] hover:bg-white"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#e8e6e1] bg-white text-[#161513]">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#161513]">{n.title}</p>
                      <span className="shrink-0 font-mono text-[11px] text-[#a8a39a]">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="mt-0.5 break-words text-sm text-[#6b665d]">{n.message}</p>
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
