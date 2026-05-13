import {
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  FileWarning,
  LockKeyhole,
  Scale,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";
import type { User } from "../lib/types";

function GlowInput({
  name,
  label,
  type = "text",
  required = true,
  rightSlot,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <label className="group relative block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 pr-11 text-sm text-slate-100 shadow-[0_8px_20px_rgba(15,23,42,0.35)] outline-none backdrop-blur transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 placeholder:text-slate-400"
      />
      {rightSlot ? <div className="absolute right-3 top-[35px] text-slate-400">{rightSlot}</div> : null}
    </label>
  );
}

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#040816] text-white lg:grid-cols-2">
      <div className="relative overflow-hidden border-b border-slate-800 p-8 lg:border-b-0 lg:border-r lg:p-12">
        <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.24),transparent_35%),radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.18),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:38px_38px]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Cg fill=%22none%22 stroke=%22rgba(148,163,184,0.12)%22 stroke-width=%220.5%22%3E%3Ccircle cx=%2240%22 cy=%2240%22 r=%2232%22/%3E%3C/g%3E%3C/svg%3E')]" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            <Shield className="h-3.5 w-3.5 text-blue-300" />
            Enterprise-grade legal intelligence
          </div>
          <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
            AI-native legal analysis.
            <br />
            Designed for trust.
          </h2>
          <p className="mt-3 max-w-lg text-slate-300">
            Clause-level risk visibility, contract intelligence, and legal copiloting in a premium secure workspace.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {([
              ["Risk Detection", FileWarning],
              ["Clause Analysis", Scale],
              ["AI Legal Assistant", Sparkles],
              ["Contract Intelligence", Fingerprint],
            ] satisfies [string, LucideIcon][]).map(([titleText, Icon], idx) => (
              <motion.div
                key={titleText}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur"
              >
                <div className="mb-2 inline-flex rounded-lg bg-blue-500/20 p-1.5">
                  <Icon className="h-4 w-4 text-blue-300" />
                </div>
                <p className="text-sm font-semibold">{titleText}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["End-to-end encrypted", "GDPR compliant", "Enterprise-ready"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
                <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                {badge}
              </span>
            ))}
          </div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="mt-7 max-w-md rounded-3xl border border-white/20 bg-[#0b1226]/80 p-4 shadow-[0_20px_50px_rgba(30,64,175,0.25)] backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Contract preview</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-200">Termination: unilateral without notice</div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-200">Liability: uncapped indemnity exposure</div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-blue-200">AI insight: Risk score 84% (High)</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid place-items-center p-5 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className="w-full max-w-md rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_0_1px_rgba(99,102,241,0.25)] backdrop-blur-xl"
        >
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
              <LockKeyhole className="h-3.5 w-3.5 text-blue-300" />
              Secure sign-in
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function LoginPage({ onLogin }: { onLogin: (u: User) => void }) {
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", res.data.access_token);
    localStorage.setItem("refreshToken", res.data.refresh_token);
    const me = await api.get<User>("/auth/me");
    onLogin(me.data);
    nav("/app/dashboard");
  }
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your legal workspace">
      <form onSubmit={submit} className="space-y-4">
        <GlowInput name="email" label="Email" />
        <GlowInput
          name="password"
          label="Password"
          type={show ? "text" : "password"}
          rightSlot={
            <button type="button" onClick={() => setShow((v) => !v)}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <Button className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-sm font-semibold shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:scale-[1.02]">
          Login
        </Button>
      </form>
      <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-3 text-center text-sm text-slate-300">
        No account? <Link to="/register" className="font-semibold text-blue-300">Create one</Link>
      </div>
    </AuthLayout>
  );
}

export function RegisterPage({ onLogin }: { onLogin: (u: User) => void }) {
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      confirm: String(fd.get("confirm")),
    };
    if (payload.password !== payload.confirm) {
      throw new Error("Passwords do not match");
    }
    await api.post("/auth/register", { name: payload.name, email: payload.email, password: payload.password });
    const login = await api.post("/auth/login", { email: payload.email, password: payload.password });
    localStorage.setItem("accessToken", login.data.access_token);
    localStorage.setItem("refreshToken", login.data.refresh_token);
    const me = await api.get<User>("/auth/me");
    onLogin(me.data);
    nav("/app/dashboard");
  }
  return (
    <AuthLayout title="Create account" subtitle="Start analyzing contracts with confidence">
      <form onSubmit={submit} className="space-y-4">
        <GlowInput name="name" label="Full name" />
        <GlowInput name="email" label="Email" />
        <GlowInput
          name="password"
          label="Password"
          type={show ? "text" : "password"}
          rightSlot={
            <button type="button" onClick={() => setShow((v) => !v)}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <GlowInput name="confirm" label="Confirm password" type={show ? "text" : "password"} />
        <Button className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-sm font-semibold shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:scale-[1.02]">
          Create account
        </Button>
      </form>
      <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-3 text-center text-sm text-slate-300">
        Already have an account? <Link to="/login" className="font-semibold text-blue-300">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
