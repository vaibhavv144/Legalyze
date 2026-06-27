import {
  Eye,
  EyeOff,
  Fingerprint,
  FileWarning,
  Scale,
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

const ease = [0.16, 1, 0.3, 1] as const;

function Field({
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
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-[#78736b]">
        {label}
      </span>
      <div className="relative">
        <input
          name={name}
          type={type}
          required={required}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="h-12 w-full rounded-md border border-[#e8e6e1] bg-white px-3.5 pr-11 text-sm text-[#161513] outline-none transition-all placeholder:text-[#a8a39a] focus:border-[#0c0b0a] focus:ring-2 focus:ring-[#161513]/10"
        />
        {rightSlot ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78736b]">{rightSlot}</div>
        ) : null}
      </div>
    </label>
  );
}

const severityRow: Record<string, string> = {
  high: "border-[#f4d9d7] bg-[#fbeae9] text-[#9f2f2d]",
  medium: "border-[#f0e4c4] bg-[#fbf3db] text-[#956400]",
  low: "border-[#d9e6d9] bg-[#ecf3ec] text-[#346538]",
};

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#fbfbfa] text-[#3a3a37] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-[#e8e6e1] bg-[#f7f6f3] p-12 lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(50%_40%_at_15%_0%,rgba(150,100,0,0.05),transparent_60%),radial-gradient(50%_40%_at_100%_10%,rgba(31,108,159,0.05),transparent_55%)]"
        />
        <div className="relative z-10 flex h-full flex-col">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[#0c0b0a] text-white">
              <Scale className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[#161513]">Legalyze</span>
          </Link>

          <div className="mt-auto">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#a8a39a]">
              Indian legal intelligence
            </p>
            <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.1] tracking-[-0.02em] text-[#0c0b0a] xl:text-5xl">
              Understand contracts
              <br />
              <span className="italic text-[#5b574f]">before</span> you sign.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#5b574f]">
              Clause-level risk visibility, contract intelligence, and a legal copilot — in one calm,
              private workspace.
            </p>

            <div className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
              {([
                ["Risk detection", FileWarning],
                ["Clause analysis", Scale],
                ["AI legal assistant", Sparkles],
                ["Contract intelligence", Fingerprint],
              ] satisfies [string, LucideIcon][]).map(([titleText, Icon], idx) => (
                <motion.div
                  key={titleText}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.1 + idx * 0.06 }}
                  className="rounded-lg border border-[#e8e6e1] bg-white p-4"
                >
                  <span className="mb-2.5 inline-grid h-9 w-9 place-items-center rounded-md border border-[#e8e6e1] bg-[#fbfbfa] text-[#161513]">
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <p className="text-sm font-semibold text-[#161513]">{titleText}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            className="mt-10 max-w-md rounded-xl border border-[#e8e6e1] bg-white p-4 shadow-[0_18px_48px_rgba(12,11,10,0.06)]"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a39a]">
              Contract preview
            </p>
            <div className="mt-3 space-y-2 text-sm">
              {([
                ["high", "Termination: unilateral without notice"],
                ["medium", "Liability: uncapped indemnity exposure"],
                ["low", "Confidentiality survives indefinitely"],
              ] as const).map(([level, text]) => (
                <div key={text} className={`rounded-lg border p-2.5 ${severityRow[level]}`}>
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form panel */}
      <div className="grid place-items-center p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="w-full max-w-md"
        >
          <div className="mb-7">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2.5 lg:hidden"
            >
              <span className="grid h-8 w-8 place-items-center rounded-md bg-[#0c0b0a] text-white">
                <Scale className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-[#161513]">Legalyze</span>
            </Link>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a8a39a]">
              {subtitle}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.02em] text-[#0c0b0a]">
              {title}
            </h1>
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
    <AuthLayout title="Welcome back" subtitle="Sign in to your workspace">
      <form onSubmit={submit} className="space-y-4">
        <Field name="email" label="Email" type="email" />
        <Field
          name="password"
          label="Password"
          type={show ? "text" : "password"}
          rightSlot={
            <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((v) => !v)}>
              {show ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
            </button>
          }
        />
        <Button className="h-12 w-full">Log in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#78736b]">
        No account?{" "}
        <Link to="/register" className="font-semibold text-[#0c0b0a] underline underline-offset-4">
          Create one
        </Link>
      </p>
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
    <AuthLayout title="Create account" subtitle="Start analyzing contracts">
      <form onSubmit={submit} className="space-y-4">
        <Field name="name" label="Full name" />
        <Field name="email" label="Email" type="email" />
        <Field
          name="password"
          label="Password"
          type={show ? "text" : "password"}
          rightSlot={
            <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((v) => !v)}>
              {show ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
            </button>
          }
        />
        <Field name="confirm" label="Confirm password" type={show ? "text" : "password"} />
        <Button className="h-12 w-full">Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#78736b]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#0c0b0a] underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
