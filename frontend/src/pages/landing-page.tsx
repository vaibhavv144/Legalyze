import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  FileText,
  Flag,
  Home,
  Lock,
  Minus,
  Package,
  PenLine,
  Plus,
  ScanSearch,
  Scale,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MarketingNavbar } from "../components/marketing-navbar";

const ease = [0.16, 1, 0.3, 1] as const;
const wrap = "mx-auto w-full max-w-[1536px] px-6 md:px-10 lg:px-20";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({
  value,
  suffix = "",
  duration = 1.6,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={`font-mono text-[11px] uppercase tracking-[0.22em] ${
        dark ? "text-[#8a8580]" : "text-[#78736b]"
      }`}
    >
      {children}
    </span>
  );
}

const stats: { value: number; suffix: string; label: string }[] = [
  { value: 10400, suffix: "+", label: "contracts analyzed" },
  { value: 47, suffix: "s", label: "median review time" },
  { value: 3200, suffix: "+", label: "clauses flagged" },
];

const features: { title: string; icon: LucideIcon; desc: string }[] = [
  {
    title: "Contract analysis",
    icon: FileSearch,
    desc: "Agreements are parsed into clause-level structure — obligations, parties, and cross-references mapped in seconds.",
  },
  {
    title: "Red-flag detection",
    icon: Flag,
    desc: "High-severity legal patterns surfaced with rationale before they become liabilities.",
  },
  {
    title: "Legal AI chat",
    icon: Bot,
    desc: "An Indian-law focused copilot that answers with citations and document context.",
  },
  {
    title: "OCR extraction",
    icon: ScanSearch,
    desc: "Scanned pages become clean, structured, searchable contract text.",
  },
  {
    title: "Clause explainer",
    icon: Sparkles,
    desc: "Plain-language meaning, risks, and negotiation guidance for any clause.",
  },
  {
    title: "Summary engine",
    icon: FileText,
    desc: "Executive briefs with parties, timelines, exposures, and action items.",
  },
];

const steps = [
  {
    no: "01",
    title: "Upload the document",
    desc: "Drag in agreements, scans, or DOCX files. Secure intake with OCR for image-based pages.",
  },
  {
    no: "02",
    title: "AI reads every clause",
    desc: "Clause extraction and legal pattern scanning run in parallel against Indian-law context.",
  },
  {
    no: "03",
    title: "Review the risks",
    desc: "Severity-tagged issues arrive with rationale and safer alternative language.",
  },
  {
    no: "04",
    title: "Decide with confidence",
    desc: "Use grounded summaries to negotiate, approve, or escalate the review.",
  },
];

const severityStyles: Record<string, string> = {
  high: "bg-[#fbeae9] text-[#9f2f2d]",
  medium: "bg-[#fbf3db] text-[#956400]",
  low: "bg-[#ecf3ec] text-[#346538]",
};

const severityLabel: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function RiskPill({ level, risk }: { level: string; risk: number }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${severityStyles[level]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {severityLabel[level]} · {risk}
    </span>
  );
}

const useCases: {
  title: string;
  category: string;
  icon: LucideIcon;
  risk: number;
  level: string;
  issues: string[];
  note: string;
}[] = [
  {
    title: "Vendor agreement",
    category: "Commercial",
    icon: Package,
    risk: 81,
    level: "high",
    issues: ["Unlimited indemnity exposure", "One-sided payment delay rights", "Auto-renewal without notice"],
    note: "Commercial risk is shifted heavily onto the vendor. Cap liability and add a mutual termination right before signing.",
  },
  {
    title: "Employment contract",
    category: "People",
    icon: Briefcase,
    risk: 73,
    level: "high",
    issues: ["Broad non-compete", "Unilateral policy amendments"],
    note: "Termination and restraint clauses need balancing on both sides.",
  },
  {
    title: "Rental agreement",
    category: "Property",
    icon: Home,
    risk: 68,
    level: "medium",
    issues: ["One-sided maintenance duties", "Delayed deposit return"],
    note: "Tenant obligations currently exceed the landlord's remedies.",
  },
  {
    title: "Non-disclosure agreement",
    category: "Confidentiality",
    icon: Lock,
    risk: 41,
    level: "low",
    issues: ["Perpetual confidentiality", "Overbroad definition"],
    note: "Enforceability depends on a reasonable scope and duration.",
  },
];

const highlights: { icon: LucideIcon; label: string }[] = [
  { icon: Scale, label: "Indian-law focused" },
  { icon: ScanSearch, label: "OCR for scanned documents" },
  { icon: FileText, label: "PDF, DOCX, JPG & PNG" },
  { icon: ShieldCheck, label: "Private by design" },
];

const audiences: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Building2,
    title: "Founders & startups",
    desc: "Review vendor, SaaS, and investment paperwork without a legal team on retainer.",
  },
  {
    icon: Briefcase,
    title: "Procurement & ops",
    desc: "Screen supplier and service agreements for one-sided terms before they are signed.",
  },
  {
    icon: Scale,
    title: "In-house legal",
    desc: "Triage routine contracts quickly and spend expert time on the clauses that matter.",
  },
  {
    icon: PenLine,
    title: "Freelancers & SMBs",
    desc: "Understand client contracts, NDAs, and scope terms in plain language.",
  },
];

const faqs = [
  ["Is this legal advice?", "No. Legalyze provides legal intelligence and educational guidance to help you understand documents. It does not replace a qualified lawyer."],
  ["Does it work with scanned PDFs?", "Yes. OCR extraction turns image-based pages into structured, searchable text before analysis."],
  ["Is it focused on Indian law?", "Yes. The chat and analysis models are tuned for Indian legal context, with citations where available."],
  ["How is my data handled?", "Documents are processed for your account only. The platform is built for privacy-aware team workflows."],
];

export function LandingPage({ loggedIn }: { loggedIn: boolean }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCase, setActiveCase] = useState(0);
  const caseCount = useCases.length;
  const goToCase = (i: number) => setActiveCase(((i % caseCount) + caseCount) % caseCount);
  const ctaHref = loggedIn ? "/app/dashboard" : "/register";

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#3a3a37]">
      <MarketingNavbar loggedIn={loggedIn} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5] [background:radial-gradient(60%_50%_at_12%_0%,rgba(150,100,0,0.05),transparent_60%),radial-gradient(50%_40%_at_100%_10%,rgba(31,108,159,0.05),transparent_55%)]"
          />
          <div className={`relative grid items-center gap-16 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32 lg:pt-28 ${wrap}`}>
            <div>
              <Reveal>
                <Eyebrow>Indian legal intelligence</Eyebrow>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="mt-6 font-serif text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-[#0c0b0a] md:text-7xl xl:text-[5.25rem]">
                  Understand contracts
                  <br />
                  <span className="italic text-[#5b574f]">before</span> you sign.
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-7 max-w-md text-lg leading-relaxed text-[#5b574f]">
                  Legalyze reads agreements clause by clause — surfacing risks, explaining language,
                  and drafting summaries so you negotiate from a position of clarity.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link
                    to={ctaHref}
                    className="group inline-flex items-center gap-2 rounded-md bg-[#0c0b0a] px-5 py-3 text-sm font-semibold text-white antialiased transition-all duration-200 hover:bg-[#2f2c28] hover:shadow-[0_8px_24px_rgba(12,11,10,0.18)] active:scale-[0.98]"
                  >
                    Start free
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.75} />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-md border border-[#e8e6e1] bg-white px-5 py-3 text-sm font-medium text-[#161513] transition-all duration-200 hover:border-[#d6d3cc] hover:bg-[#f6f4ef] active:scale-[0.98]"
                  >
                    Watch demo
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-[#e8e6e1] pt-7">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dt className="font-mono text-2xl tabular-nums text-[#0c0b0a]">
                        <CountUp value={s.value} suffix={s.suffix} />
                      </dt>
                      <dd className="mt-1 text-xs text-[#78736b]">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            {/* Faux app window */}
            <Reveal delay={0.15}>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
                className="rounded-xl border border-[#e8e6e1] bg-white shadow-[0_18px_60px_rgba(12,11,10,0.08)]"
              >
                <div className="flex items-center gap-2 border-b border-[#eeece7] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e4e1da]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e4e1da]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e4e1da]" />
                  <span className="ml-2 font-mono text-[11px] text-[#a8a39a]">vendor-agreement.pdf</span>
                  <span className="ml-auto rounded-full bg-[#fbeae9] px-2.5 py-0.5 font-mono text-[11px] tabular-nums text-[#9f2f2d]">
                    Risk 78
                  </span>
                </div>
                <div className="space-y-3 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a39a]">
                    Detected issues
                  </p>
                  {[
                    ["high", "Unilateral termination without notice"],
                    ["medium", "Broad indemnity across unrelated claims"],
                    ["low", "Confidentiality survives indefinitely"],
                  ].map(([level, text], i) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease, delay: 0.3 + i * 0.12 }}
                      className="flex items-start gap-3 rounded-lg border border-[#eeece7] bg-[#fcfbf9] p-3"
                    >
                      <span
                        className={`mt-0.5 shrink-0 rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${severityStyles[level]}`}
                      >
                        {level}
                      </span>
                      <p className="text-sm leading-snug text-[#3a3a37]">{text}</p>
                    </motion.div>
                  ))}
                  <div className="rounded-lg border border-[#e6ede6] bg-[#f3f7f3] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#346538]">
                      Recommendation
                    </p>
                    <p className="mt-1.5 text-sm leading-snug text-[#2f4a32]">
                      Add mutual notice period and a liability cap tied to fees paid.
                    </p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        {/* Highlights strip */}
        <section className="border-y border-[#e8e6e1] bg-[#f7f6f3]">
          <div className={`flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-6 ${wrap}`}>
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.label}
                  className="group flex items-center gap-2.5 text-sm font-medium text-[#5b574f]"
                >
                  <Icon
                    className="h-4 w-4 text-[#0c0b0a] transition-transform duration-300 group-hover:-translate-y-0.5"
                    strokeWidth={1.75}
                  />
                  {h.label}
                </div>
              );
            })}
          </div>
        </section>

        {/* Features bento */}
        <section id="features" className={`py-24 lg:py-32 ${wrap}`}>
          <Reveal className="max-w-2xl">
            <Eyebrow>Platform</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-[-0.02em] text-[#0c0b0a] md:text-5xl">
              Everything you need to read a contract carefully.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#5b574f]">
              Six capabilities that work together — from raw upload to a negotiation-ready brief.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-[#e8e6e1] bg-[#e8e6e1] sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={(i % 3) * 0.06}>
                  <div className="group relative flex h-full flex-col overflow-hidden bg-[#fcfbf9] p-8 transition-colors duration-300 hover:bg-white lg:p-10">
                    <span className="absolute left-0 top-0 h-px w-0 bg-[#0c0b0a] transition-all duration-500 group-hover:w-full" />
                    <span className="grid h-11 w-11 place-items-center rounded-md border border-[#e8e6e1] bg-white text-[#161513] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#0c0b0a] group-hover:bg-[#0c0b0a] group-hover:text-white">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-6 text-lg font-semibold tracking-tight text-[#161513]">
                      {f.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-[#6b665d]">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* How it works — black band */}
        <section id="how" className="bg-[#0c0b0a] text-[#e9e7e2]">
          <div className={`py-24 lg:py-32 ${wrap}`}>
            <Reveal className="max-w-2xl">
              <Eyebrow dark>How it works</Eyebrow>
              <h2 className="mt-4 font-serif text-4xl font-medium tracking-[-0.02em] text-white md:text-5xl">
                From upload to decision in four steps.
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-[#262421] bg-[#262421] md:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <Reveal key={s.no} delay={i * 0.08}>
                  <div className="group h-full bg-[#141210] p-7 transition-colors duration-300 hover:bg-[#1b1916] lg:p-8">
                    <span className="font-mono text-sm tabular-nums text-[#6f6a63] transition-colors duration-300 group-hover:text-white">
                      {s.no}
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#a39e96]">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section id="use-cases" className={`py-24 lg:py-32 ${wrap}`}>
          <Reveal className="max-w-2xl">
            <Eyebrow>Use cases</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-[-0.02em] text-[#0c0b0a] md:text-5xl">
              Built for the contracts you actually sign.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#5b574f]">
              A look at what Legalyze surfaces across the agreements people sign most often.
            </p>
          </Reveal>

          <Reveal className="mt-16">
            {/* Coverflow carousel */}
            <motion.div
              className="relative mx-auto h-[470px] w-full cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing md:h-[500px]"
              style={{ perspective: "1700px" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                const swipe = info.offset.x;
                const velocity = info.velocity.x;
                if (swipe < -60 || velocity < -400) goToCase(activeCase + 1);
                else if (swipe > 60 || velocity > 400) goToCase(activeCase - 1);
              }}
            >
              {useCases.map((u, i) => {
                const Icon = u.icon;
                let offset = i - activeCase;
                if (offset > caseCount / 2) offset -= caseCount;
                else if (offset < -caseCount / 2) offset += caseCount;
                const abs = Math.abs(offset);
                const isActive = offset === 0;
                return (
                  <motion.button
                    key={u.title}
                    type="button"
                    onClick={() => goToCase(i)}
                    aria-label={`Focus ${u.title}`}
                    className="absolute left-1/2 top-1/2 cursor-pointer text-left outline-none"
                    style={{
                      width: "min(89vw, 470px)",
                      marginLeft: "max(-44.5vw, -235px)",
                      marginTop: "-215px",
                      transformStyle: "preserve-3d",
                    }}
                    animate={{
                      x: offset * 305,
                      scale: isActive ? 1 : abs === 1 ? 0.85 : 0.72,
                      opacity: abs > 2 ? 0 : isActive ? 1 : abs === 1 ? 0.9 : 0.45,
                      rotateY: isActive ? 0 : offset > 0 ? -20 : 20,
                      filter: isActive ? "blur(0px)" : abs === 1 ? "blur(1.5px)" : "blur(4px)",
                      zIndex: 50 - abs,
                      pointerEvents: abs > 2 ? "none" : "auto",
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 28 }}
                  >
                    <div
                      className={`flex h-[430px] flex-col overflow-hidden rounded-2xl border bg-white p-7 transition-shadow duration-300 md:p-9 ${
                        isActive
                          ? "border-[#0c0b0a] shadow-[0_28px_64px_rgba(12,11,10,0.14)]"
                          : "border-[#e8e6e1] shadow-[0_12px_32px_rgba(12,11,10,0.06)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`grid h-12 w-12 place-items-center rounded-lg border transition-colors duration-300 ${
                            isActive
                              ? "border-[#0c0b0a] bg-[#0c0b0a] text-white"
                              : "border-[#e8e6e1] bg-[#fbfbfa] text-[#161513]"
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.6} />
                        </span>
                        <RiskPill level={u.level} risk={u.risk} />
                      </div>

                      <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.2em] text-[#a8a39a]">
                        {u.category}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-medium tracking-[-0.02em] text-[#0c0b0a] md:text-3xl">
                        {u.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-[#5b574f]">{u.note}</p>

                      <div className="mt-auto pt-6">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a39a]">
                          Detected issues
                        </p>
                        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                          {u.issues.map((issue) => (
                            <li
                              key={issue}
                              className="flex items-start gap-2.5 rounded-lg border border-[#eeece7] bg-[#fcfbf9] px-3.5 py-3 text-sm leading-snug text-[#3a3a37]"
                            >
                              <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9f2f2d]" strokeWidth={2} />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => goToCase(activeCase - 1)}
                aria-label="Previous"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#e8e6e1] bg-white text-[#161513] transition-all duration-200 hover:-translate-x-0.5 hover:border-[#0c0b0a]"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>

              <div className="flex items-center gap-2">
                {useCases.map((u, i) => (
                  <button
                    key={u.title}
                    type="button"
                    onClick={() => goToCase(i)}
                    aria-label={`Go to ${u.title}`}
                    aria-current={i === activeCase}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeCase ? "w-7 bg-[#0c0b0a]" : "w-1.5 bg-[#d6d3cc] hover:bg-[#a8a39a]"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => goToCase(activeCase + 1)}
                aria-label="Next"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#e8e6e1] bg-white text-[#161513] transition-all duration-200 hover:translate-x-0.5 hover:border-[#0c0b0a]"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-[#a8a39a]">
              Drag, swipe, or click a card to bring it into focus
            </p>
          </Reveal>
        </section>

        {/* Who it's for */}
        <section id="who" className="border-y border-[#e8e6e1] bg-[#f7f6f3]">
          <div className={`py-24 lg:py-32 ${wrap}`}>
            <Reveal className="max-w-2xl">
              <Eyebrow>Who it's for</Eyebrow>
              <h2 className="mt-4 font-serif text-4xl font-medium tracking-[-0.02em] text-[#0c0b0a] md:text-5xl">
                Built for anyone who signs contracts.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[#5b574f]">
                From first-time founders to in-house counsel, Legalyze adapts to how carefully you
                need to read.
              </p>
            </Reveal>
            <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-[#e8e6e1] bg-[#e8e6e1] sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map((a, i) => {
                const Icon = a.icon;
                return (
                  <Reveal key={a.title} delay={(i % 4) * 0.06}>
                    <div className="group flex h-full flex-col bg-[#fcfbf9] p-8 transition-colors duration-300 hover:bg-white">
                      <span className="grid h-11 w-11 place-items-center rounded-md border border-[#e8e6e1] bg-white text-[#161513] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#0c0b0a] group-hover:bg-[#0c0b0a] group-hover:text-white">
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </span>
                      <h3 className="mt-6 text-lg font-semibold tracking-tight text-[#161513]">
                        {a.title}
                      </h3>
                      <p className="mt-2.5 text-[15px] leading-relaxed text-[#6b665d]">{a.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-3xl px-6 py-24 md:px-10 lg:py-32">
          <Reveal>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-[-0.02em] text-[#0c0b0a] md:text-5xl">
              Questions, answered.
            </h2>
          </Reveal>
          <div className="mt-10 border-t border-[#e8e6e1]">
            {faqs.map(([q, a], i) => {
              const open = openFaq === i;
              return (
                <div key={q} className="border-b border-[#e8e6e1]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#0c0b0a]"
                  >
                    <span className="text-base font-medium text-[#161513]">{q}</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e8e6e1] text-[#78736b] transition-all duration-300 hover:border-[#0c0b0a] hover:text-[#0c0b0a]">
                      {open ? <Minus className="h-3.5 w-3.5" strokeWidth={2} /> : <Plus className="h-3.5 w-3.5" strokeWidth={2} />}
                    </span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pr-8 text-[15px] leading-relaxed text-[#6b665d]">{a}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section id="pricing" className={`pb-24 lg:pb-32 ${wrap}`}>
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#0c0b0a] px-8 py-16 text-center md:px-16 md:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(40%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_70%)]"
              />
              <h2 className="relative mx-auto max-w-2xl font-serif text-4xl font-medium leading-tight tracking-[-0.02em] text-white md:text-5xl">
                Read the fine print before it costs you.
              </h2>
              <p className="relative mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[#b8b3aa]">
                Start with AI contract intelligence today. No credit card required.
              </p>
              <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to={ctaHref}
                  className="group inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#0c0b0a] antialiased transition-all duration-200 hover:shadow-[0_8px_24px_rgba(255,255,255,0.16)] active:scale-[0.98]"
                >
                  Start free
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={1.75} />
                </Link>
                <a
                  href="mailto:hello@legalyze.ai"
                  className="inline-flex items-center gap-2 rounded-md border border-[#544f49] px-5 py-3 text-sm font-semibold text-white antialiased transition-colors duration-200 hover:bg-[#211f1b]"
                >
                  Book a demo
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer id="about" className="border-t border-[#e8e6e1] bg-[#f7f6f3]">
        <div className={`grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr] ${wrap}`}>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-[#0c0b0a] text-[#fbfbfa]">
                <FileText className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-[#161513]">Legalyze</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#78736b]">
              AI-native legal intelligence for contract review, risk detection, and clause-level clarity.
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#a8a39a]">Product</p>
            <div className="mt-3 space-y-2 text-sm text-[#3a3a37]">
              <a href="#features" className="block w-fit transition-colors hover:text-[#0c0b0a]">Features</a>
              <a href="#how" className="block w-fit transition-colors hover:text-[#0c0b0a]">How it works</a>
              <a href="#use-cases" className="block w-fit transition-colors hover:text-[#0c0b0a]">Use cases</a>
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#a8a39a]">Legal</p>
            <div className="mt-3 space-y-2 text-sm text-[#3a3a37]">
              <a href="#" className="block w-fit transition-colors hover:text-[#0c0b0a]">Privacy policy</a>
              <a href="#" className="block w-fit transition-colors hover:text-[#0c0b0a]">Terms of service</a>
              <a href="mailto:hello@legalyze.ai" className="block w-fit transition-colors hover:text-[#0c0b0a]">hello@legalyze.ai</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#e8e6e1]">
          <div className={`flex flex-col items-start justify-between gap-2 py-5 text-xs text-[#a8a39a] sm:flex-row sm:items-center ${wrap}`}>
            <span>© {new Date().getFullYear()} Legalyze. All rights reserved.</span>
            <span>Not a substitute for professional legal advice.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
