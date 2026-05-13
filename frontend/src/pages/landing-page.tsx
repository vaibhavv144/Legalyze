import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSearch,
  FileText,
  Flag,
  PlayCircle,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Star,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingNavbar } from "../components/marketing-navbar";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export function LandingPage({ loggedIn }: { loggedIn: boolean }) {
  const featureItems: {
    title: string;
    icon: LucideIcon;
    desc: string;
    preview: string;
  }[] = [
    { title: "Contract Analysis", icon: FileSearch, desc: "Structure agreements into clause-level intelligence instantly.", preview: "Clause map + obligation graph" },
    { title: "Risk Detection", icon: Flag, desc: "Identify high-severity legal patterns before they become liabilities.", preview: "Severity heatmap + rationale" },
    { title: "Legal AI Chat", icon: Bot, desc: "Indian-law focused copilot with citations and document context.", preview: "Contextual answer + sources" },
    { title: "OCR Intelligence", icon: ScanSearch, desc: "Extract clean text from scans for analysis and search.", preview: "OCR pipeline + cleanup" },
    { title: "Clause Explainer", icon: Sparkles, desc: "Plain-language meaning, risks, and negotiation guidance per clause.", preview: "Explain + alternatives" },
    { title: "Summary Engine", icon: FileText, desc: "Executive-ready summaries with obligations, timelines, and risks.", preview: "One-page legal brief" },
  ];

  const featuresTrackRef = useRef<HTMLDivElement>(null);
  const featureCardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  /** During infinite-loop scroll repositioning, suppress scroll-handler → setState jitter */
  const featureLoopJumpingRef = useRef(false);
  const baseFeatureCount = featureItems.length;
  const loopedFeatureItems = [...featureItems, ...featureItems, ...featureItems];
  const [featureActive, setFeatureActive] = useState(baseFeatureCount);
  const featureCount = baseFeatureCount;
  const normalizeFeatureIndex = useCallback(
    (index: number) => ((index % baseFeatureCount) + baseFeatureCount) % baseFeatureCount,
    [baseFeatureCount],
  );

  const centerScrollOnCard = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const track = featuresTrackRef.current;
    const el = featureCardRefs.current[index];
    if (!track || !el) return;
    const target = el.offsetLeft - (track.clientWidth / 2 - el.offsetWidth / 2);
    track.scrollTo({ left: Math.max(target, 0), behavior });
  }, []);

  const snapFeatureToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      centerScrollOnCard(index, behavior);
    },
    [centerScrollOnCard],
  );

  const findNearestFeatureIndexToCenter = useCallback(() => {
    const track = featuresTrackRef.current;
    if (!track) return 0;
    const center = track.scrollLeft + track.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    featureCardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const mid = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }, []);

  /** After scroll settles: snap from clone segments back into the middle third (6→1 wrap). */
  const reconcileFeatureLoopPosition = useCallback(() => {
    const track = featuresTrackRef.current;
    if (!track || featureLoopJumpingRef.current) return;
    const n = baseFeatureCount;
    const bestIdx = findNearestFeatureIndexToCenter();
    if (bestIdx < n) {
      const twin = bestIdx + n;
      featureLoopJumpingRef.current = true;
      centerScrollOnCard(twin, "auto");
      setFeatureActive(twin);
      requestAnimationFrame(() => {
        featureLoopJumpingRef.current = false;
      });
      return;
    }
    if (bestIdx >= n * 2) {
      const twin = bestIdx - n;
      featureLoopJumpingRef.current = true;
      centerScrollOnCard(twin, "auto");
      setFeatureActive(twin);
      requestAnimationFrame(() => {
        featureLoopJumpingRef.current = false;
      });
    }
  }, [baseFeatureCount, centerScrollOnCard, findNearestFeatureIndexToCenter]);

  const updateFeatureActiveFromScroll = useCallback(() => {
    if (featureLoopJumpingRef.current) return;
    setFeatureActive(findNearestFeatureIndexToCenter());
  }, [findNearestFeatureIndexToCenter]);

  useEffect(() => {
    const track = featuresTrackRef.current;
    if (!track) return;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const flushReconcileSoon = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        reconcileFeatureLoopPosition();
      }, 120);
    };
    const onScroll = () => {
      updateFeatureActiveFromScroll();
      flushReconcileSoon();
    };
    const onScrollEnd = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = null;
      reconcileFeatureLoopPosition();
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("scrollend", onScrollEnd);
    updateFeatureActiveFromScroll();
    return () => {
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", onScrollEnd);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [reconcileFeatureLoopPosition, updateFeatureActiveFromScroll]);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      if (!featureCardRefs.current[baseFeatureCount]) return;
      featureLoopJumpingRef.current = true;
      centerScrollOnCard(baseFeatureCount, "auto");
      setFeatureActive(baseFeatureCount);
      requestAnimationFrame(() => {
        featureLoopJumpingRef.current = false;
      });
    });
    return () => cancelAnimationFrame(t);
  }, [baseFeatureCount, centerScrollOnCard]);

  useEffect(() => {
    const track = featuresTrackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updateFeatureActiveFromScroll());
    ro.observe(track);
    return () => ro.disconnect();
  }, [updateFeatureActiveFromScroll]);

  const useCases = [
    { title: "Rental Agreement", risk: "68", issues: ["One-sided maintenance duties", "Delayed deposit return"], summary: "Tenant obligations exceed landlord remedies." },
    { title: "Employment Contract", risk: "73", issues: ["Broad non-compete", "Unilateral policy amendments"], summary: "Termination and restraint clauses need balancing." },
    { title: "NDA", risk: "41", issues: ["Perpetual confidentiality", "Overbroad definition"], summary: "NDA enforceability depends on reasonable scope and duration." },
    { title: "Vendor Agreement", risk: "81", issues: ["Unlimited indemnity", "Payment delay rights"], summary: "Commercial risk is shifted heavily to vendor side." },
    { title: "Freelance Contract", risk: "59", issues: ["IP transfer overreach", "Penalty-heavy late delivery"], summary: "Improve milestone acceptance and liability language." },
  ];
  const testimonials = [
    { quote: "Reduced contract review time by 70% within one quarter.", name: "Ananya Rao", role: "General Counsel", company: "FinEdge" },
    { quote: "We now catch legal red flags before negotiation calls.", name: "Rohit Mehra", role: "Head of Procurement", company: "ScaleOps" },
    { quote: "Clause-level AI insights changed our entire legal workflow.", name: "Ira Khanna", role: "Founder", company: "Nexa Labs" },
    { quote: "Our team gets risk-ready summaries before leadership reviews.", name: "Raghav Sethi", role: "Operations Lead", company: "MeridianX" },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#040816] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.24),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.17),transparent_30%),radial-gradient(circle_at_60%_85%,rgba(14,165,233,0.14),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <MarketingNavbar loggedIn={loggedIn} />
      <main className="relative z-10">
        <section className="mx-auto grid max-w-[1400px] gap-16 px-6 pb-28 pt-24 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trusted by legal teams
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.03] tracking-tight md:text-7xl">
              Understand Contracts
              <br />Before You Sign.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-slate-300">
              Premium Indian legal intelligence for chat, contract analysis, red-flag detection, and clause-level guidance.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
              <span>10k+ contracts analyzed</span>
              <span>Secure</span>
              <span>AI-powered</span>
              <span>Private</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={loggedIn ? "/app/dashboard" : "/register"}>
                <Button size="lg" className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-6 shadow-[0_12px_40px_rgba(37,99,235,0.45)]">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="h-12 rounded-2xl border-slate-700 bg-slate-900/40 text-slate-100 hover:bg-slate-800">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="relative overflow-hidden rounded-[28px] border-slate-700/80 bg-[#070f22]/80 p-6 shadow-[0_35px_120px_rgba(2,6,23,0.65)]">
              <div className="absolute right-6 top-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Risk score 78%</div>
              <div className="mb-4 text-xs uppercase tracking-[0.2em] text-slate-400">AI Contract Intelligence</div>
              <div className="space-y-3">
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">High: unilateral termination without notice</div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-200">Medium: broad indemnity across unrelated claims</div>
                <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 text-sm text-blue-200">Recommendation: add mutual notice and liability cap</div>
              </div>
            </Card>
          </motion.div>
        </section>

        <section id="features" className="relative mx-auto max-w-none px-6 py-28">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-blue-600/25 blur-[100px]" />
            <div className="absolute right-[6%] top-[42%] h-80 w-80 rounded-full bg-indigo-500/20 blur-[110px]" />
            <motion.div aria-hidden className="absolute inset-0 opacity-[0.45]" animate={{ opacity: [0.35, 0.52, 0.35] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}>
              {[...Array(18)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-px w-px rounded-full bg-sky-200/70 shadow-[0_0_14px_rgba(56,189,248,0.75)]"
                  style={{ left: `${(i * 73) % 100}%`, top: `${((i * 47) % 100) / 100 * 92 + 4}%`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </motion.div>
          </div>

          <div className="mx-auto max-w-[1400px]">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300/80">Platform capabilities</p>
            <h2 className="mt-3 text-4xl font-bold md:text-5xl">Built for AI-native legal operations</h2>
            <p className="mt-3 max-w-2xl text-base text-slate-400 md:text-lg">
              Drag or scroll sideways — stacked cards reveal depth. The centered card stays sharp and luminous; periphery cards fade into the backdrop so you always see more ahead.
            </p>
          </div>

          <div className="relative mt-14 w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-[#040816] to-transparent md:w-24" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-[#040816] to-transparent md:w-24" />

            <div
              ref={featuresTrackRef}
              className="no-scrollbar flex snap-x snap-mandatory gap-0 overflow-x-auto overflow-y-visible px-6 pb-6 pt-2 [scroll-behavior:smooth] [-webkit-overflow-scrolling:touch]"
              role="list"
              aria-roledescription="carousel"
              aria-label="Platform capability cards"
              data-framer-carousel
            >
              {loopedFeatureItems.map((f, index) => {
                const Icon = f.icon;
                const dist = Math.abs(index - featureActive);
                const isActive = dist === 0;
                const adjacent = dist === 1;
                const widthClass = isActive ? "w-[min(90vw,700px)]" : adjacent ? "w-[min(84vw,560px)]" : "w-[min(80vw,500px)]";
                const aspectClass = isActive ? "h-[min(66vw,450px)]" : adjacent ? "h-[min(58vw,390px)]" : "h-[min(52vw,350px)]";
                const scaleNum = isActive ? 1 : adjacent ? 0.9 : 0.82;
                const opacityNum = isActive ? 1 : adjacent ? 0.78 : 0.62;
                const blurPx = isActive ? 0 : adjacent ? 2 : 6;
                const z = Math.max(0, 60 - Math.min(dist, 30));
                return (
                  <motion.button
                    type="button"
                    key={`${f.title}-${index}`}
                    ref={(el) => {
                      featureCardRefs.current[index] = el;
                    }}
                    layout
                    role="listitem"
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`${f.title}${isActive ? ", active" : ""}`}
                    onClick={() => snapFeatureToIndex(index)}
                    className={`group relative shrink-0 snap-center rounded-[30px] text-left outline-none ${widthClass}`}
                    style={{ marginInline: "-2.75rem", scrollSnapAlign: "center" }}
                    initial={false}
                    animate={{
                      scale: scaleNum,
                      opacity: opacityNum,
                      rotateY: adjacent && !isActive ? (index < featureActive ? 4 : -4) : 0,
                      y: adjacent && !isActive ? 10 : isActive ? 0 : 16,
                      zIndex: z,
                      filter: `blur(${blurPx}px) saturate(${isActive ? 1 : 0.92}) brightness(${isActive ? 1 : adjacent ? 0.92 : 0.86})`,
                    }}
                    transition={{ type: "spring", stiffness: 170, damping: 28, mass: 0.9 }}
                    whileHover={{
                      scale: scaleNum + 0.02,
                      y: isActive ? -6 : adjacent ? -2 : -1,
                      boxShadow: isActive ? "0 40px 100px rgba(37,99,235,0.45)" : "0 26px 60px rgba(15,23,42,0.55)",
                      rotateY: adjacent && !isActive ? (index < featureActive ? 5 : -5) : isActive ? 1 : 0,
                    }}
                    whileTap={{ scale: scaleNum - 0.02 }}
                  >
                    <motion.div aria-hidden layout className="pointer-events-none absolute -inset-px rounded-[31px]" animate={{ opacity: isActive ? 0.87 : adjacent ? 0.35 : 0.08 }} transition={{ duration: 0.4 }}>
                      <div className="absolute inset-0 rounded-[31px] bg-[conic-gradient(from_120deg,#38bdf8,transparent_25%,transparent_75%,#6366f1)] blur-md" />
                      <div className="absolute inset-[1px] rounded-[30px] bg-[#071126]" />
                    </motion.div>

                    <Card
                      className={`relative overflow-hidden rounded-[30px] p-8 transition-shadow duration-[400ms] ${aspectClass} border ${
                        isActive
                          ? "border-blue-400/45 bg-[#071329]/92 shadow-[0_40px_120px_rgba(37,99,235,0.38),inset_0_1px_0_rgba(255,255,255,0.06)] ring-2 ring-blue-500/55"
                          : "border-slate-700/80 bg-[#060e1f]/88 shadow-[0_18px_55px_rgba(2,6,23,0.55)]"
                      }`}
                    >
                      <div className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-blue-500/18 blur-[60px]" />
                      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-56 w-56 rounded-full bg-indigo-500/16 blur-[70px]" />

                      <Icon className="relative h-6 w-6 text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.55)]" />
                      <h3 className="relative mt-4 text-left text-[1.85rem] font-semibold tracking-tight text-white md:text-[2rem]">{f.title}</h3>
                      <p className="relative mt-3 max-w-md text-[15px] leading-relaxed text-slate-300">{f.desc}</p>

                      <div className="relative mt-6 flex flex-wrap gap-3">
                        <span className="rounded-full border border-blue-400/35 bg-blue-500/14 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-sky-200">AI preview</span>
                        <span className="rounded-full border border-slate-700/70 bg-[#080f20]/80 px-3 py-1 text-[11px] text-slate-400">{f.preview}</span>
                      </div>

                      <div className="relative mt-6 rounded-2xl border border-slate-700/85 bg-[#080f21]/92 p-4 ring-1 ring-white/[0.04]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Live sample</p>
                            <p className="mt-2 text-sm text-slate-200">
                              {f.title === "Contract Analysis" && "Clause graph · obligations · cross-references mapped in seconds."}
                              {f.title === "Risk Detection" && "Flagged issues with severity, Indian-law context, and negotiation notes."}
                              {f.title === "Legal AI Chat" && "Grounded answers with citations and follow-up threads."}
                              {f.title === "OCR Intelligence" && "Scanned pages become structured, searchable contract text."}
                              {f.title === "Clause Explainer" && "Plain-language rewrite + safer alternative phrasing suggestions."}
                              {f.title === "Summary Engine" && "Executive brief: parties, timelines, exposures, action items."}
                            </p>
                          </div>
                          <motion.div aria-hidden animate={{ rotate: isActive ? [0, 2, -2, 0] : 0 }} transition={{ repeat: isActive ? Infinity : 0, duration: 5, ease: "easeInOut" }} className="hidden shrink-0 rounded-xl border border-sky-400/35 bg-[linear-gradient(135deg,rgba(37,99,235,0.35),transparent_52%)] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:block md:w-[9.5rem]">
                            Synth
                          </motion.div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {[0, 1, 2].map((chunk) => (
                            <motion.div key={chunk} layout className="h-2 flex-1 rounded-full bg-slate-800/90" animate={{ opacity: isActive ? 1 : 0.45 }} transition={{ duration: 0.4 }}>
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400"
                                animate={{ width: isActive ? `${40 + chunk * 18}%` : "32%" }}
                                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.button>
                );
              })}
            </div>

            <div className="mx-auto mt-5 max-w-[1400px] px-6">
              <div className="flex items-center gap-5 text-xs text-slate-500 md:text-[13px]">
                <span>Drag horizontally · Release to snap</span>
                <span className="hidden text-slate-600 md:inline">&middot;</span>
                <span className="hidden md:inline">{normalizeFeatureIndex(featureActive) + 1} / {featureCount}</span>
              </div>
              <div className="mt-2 h-1.5 w-full max-w-xl rounded-full bg-slate-800/90">
                <motion.div
                  layout
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
                  style={{ width: `${((normalizeFeatureIndex(featureActive) + 1) / featureCount) * 100}%` }}
                  transition={{ type: "spring", stiffness: 170, damping: 26 }}
                />
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-[1400px] px-6 py-28">
          <h2 className="text-4xl font-bold md:text-5xl">How it works</h2>
          <p className="mt-3 text-lg text-slate-300">Scroll through the legal intelligence workflow</p>
          <div className="relative mt-8">
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-violet-500/0" />
            <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
              {[
                { title: "Upload Contract", desc: "Drag-and-drop agreements, scans, and DOCX files into secure intake.", meta: "Step 01", visual: "Drop zone + OCR intake" },
                { title: "AI Analysis", desc: "Clause extraction and legal pattern scanning run in parallel.", meta: "Step 02", visual: "Live risk scanner + parser" },
                { title: "Understand Risks", desc: "Receive severity-tagged issues, rationale, and safer alternatives.", meta: "Step 03", visual: "Risk highlights + annotations" },
                { title: "Make Decision", desc: "Use AI-backed summaries to negotiate, approve, or escalate review.", meta: "Step 04", visual: "Decision dashboard + actions" },
              ].map((item) => (
                <motion.div key={item.title} whileHover={{ y: -6, scale: 1.01 }} className="snap-start">
                  <Card className="h-[360px] w-[560px] rounded-[28px] border-slate-700 bg-[#071126]/80 p-7 shadow-[0_20px_50px_rgba(2,6,23,0.55)]">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-300">{item.meta}</p>
                    <h3 className="mt-3 text-3xl font-semibold">{item.title}</h3>
                    <p className="mt-2 max-w-md text-base text-slate-300">{item.desc}</p>
                    <div className="mt-6 rounded-2xl border border-slate-700 bg-[#0a152e] p-4 text-sm text-slate-300">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Visualization</p>
                      <p className="mt-2">{item.visual}</p>
                    </div>
                    <p className="mt-4 text-xs text-slate-400">Snap-scroll storytelling experience</p>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-slate-800">
              <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-28">
          <h2 className="text-4xl font-bold md:text-5xl">Use cases</h2>
          <p className="mt-3 text-lg text-slate-300">Horizontal scenario cards with contract-specific intelligence</p>
          <div className="relative mt-8">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#040816] to-transparent" />
            <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
              {useCases.map((u) => (
                <motion.div key={u.title} whileHover={{ y: -5, scale: 1.01 }} className="snap-start">
                  <Card className="h-[360px] w-[620px] rounded-[28px] border-slate-700 bg-[#071126]/85 p-6">
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-semibold">{u.title}</h3>
                      <span className="rounded-full border border-blue-500/35 bg-blue-500/15 px-3 py-1 text-xs text-blue-200">
                        Risk score {u.risk}%
                      </span>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-700 bg-[#0a152d] p-3 text-xs text-slate-300">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Contract preview</p>
                        <p className="mt-2">Highlighted clauses and obligations mapped by AI parser.</p>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-[#0a152d] p-3 text-xs text-slate-300 md:col-span-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Detected issues</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4">
                          {u.issues.map((issue) => <li key={issue}>{issue}</li>)}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-sm text-violet-100">
                      Recommendation: {u.summary}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-slate-800">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-28">
          <h2 className="text-4xl font-bold md:text-5xl">Trusted by legal-forward teams</h2>
          <div className="mt-3 flex gap-5 text-sm text-slate-300">
            <span>95% faster contract review</span>
            <span>82% better risk visibility</span>
          </div>
          <div className="relative mt-8">
            <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
              {testimonials.map((t) => (
                <motion.div key={t.name} whileHover={{ y: -6, scale: 1.01 }} className="snap-start">
                  <Card className="h-[300px] w-[560px] rounded-[28px] border-slate-700 bg-[#071126]/85 p-7 shadow-[0_20px_50px_rgba(37,99,235,0.18)]">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex gap-1 text-blue-300">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">Verified</span>
                    </div>
                    <p className="text-xl font-medium leading-relaxed text-slate-100">"{t.quote}"</p>
                    <div className="mt-8">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role} · {t.company}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-slate-800">
              <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 py-28">
          <h2 className="text-center text-4xl font-bold md:text-5xl">FAQ</h2>
          <div className="mt-8 space-y-3">
            {[
              ["Is this legal advice?", "No. It provides legal intelligence and educational guidance."],
              ["Does it support scanned PDFs?", "Yes, OCR-powered extraction is built in."],
              ["Can we use it with enterprise workflows?", "Yes, designed for privacy-aware team workflows."],
            ].map(([q, a]) => (
              <details key={q} className="rounded-3xl border border-slate-700 bg-[#071126]/80 p-5">
                <summary className="cursor-pointer text-lg font-semibold">{q}</summary>
                <p className="mt-2 text-sm text-slate-300">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-[1400px] px-6 pb-28 pt-14">
          <Card className="relative overflow-hidden rounded-[30px] border-slate-700 bg-gradient-to-r from-blue-950/40 via-[#0a1328] to-violet-950/35 p-12 text-center">
            <Workflow className="mx-auto h-7 w-7 text-blue-300" />
            <h3 className="mt-4 text-4xl font-bold">Ready to legal-proof your decisions?</h3>
            <p className="mt-2 text-slate-300">No credit card required. Start with AI contract intelligence today.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to={loggedIn ? "/app/dashboard" : "/register"}>
                <Button size="lg" className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-6">
                  Start Free
                </Button>
              </Link>
              <Button size="lg" variant="secondary" className="h-12 rounded-2xl border-slate-600 bg-slate-900/40 text-slate-100">
                Book Demo
              </Button>
            </div>
            <div className="mt-4 inline-flex items-center gap-1 text-xs text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              Enterprise-ready security controls
            </div>
          </Card>
        </section>
      </main>

      <footer id="about" className="border-t border-slate-800 bg-[#040816]">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold">Legalyze</h4>
            <p className="mt-2 max-w-sm text-sm text-slate-400">AI-native legal intelligence platform for contract review, risk detection, and legal clarity.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Product</p>
            <div className="mt-2 space-y-1 text-sm text-slate-300"><p>Features</p><p>Pricing</p><p>Roadmap</p></div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Legal</p>
            <div className="mt-2 space-y-1 text-sm text-slate-300"><p>Privacy</p><p>Terms</p><p>Security</p></div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Contact</p>
            <div className="mt-2 space-y-1 text-sm text-slate-300"><p>support@legalyze.ai</p><p>LinkedIn</p><p>X</p></div>
          </div>
        </div>
        <div className="mx-auto max-w-[1400px] border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
          Legalyze © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
