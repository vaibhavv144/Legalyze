import { FileText, LayoutDashboard, MessageSquare, Scale, Settings, Upload, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

const navItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Legal Chat", href: "/app/chat", icon: MessageSquare },
  { label: "Upload Contract", href: "/app/upload", icon: Upload },
  { label: "Documents", href: "/app/documents", icon: FileText },
  { label: "Profile", href: "/app/profile", icon: UserRound },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-slate-800/80 bg-[#050b18]/90 p-4 backdrop-blur-xl lg:flex">
      <Link to="/app/dashboard" className="mb-8 flex items-center gap-2.5 rounded-xl px-2 py-1 outline-none ring-blue-500/0 transition hover:bg-white/[0.04] focus-visible:ring-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-[0_8px_24px_rgba(37,99,235,0.35)]">
          <Scale className="h-4 w-4 text-white" aria-hidden />
        </span>
        <span className="text-sm font-semibold tracking-wide text-slate-100">Legalyze</span>
      </Link>

      <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Workspace</p>
      <nav className="flex flex-1 flex-col gap-0.5" aria-label="Workspace navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium outline-none ring-blue-500/0 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400/70",
                active
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_10px_32px_rgba(37,99,235,0.35)]"
                  : "text-slate-400 hover:bg-slate-800/65 hover:text-slate-100",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <p className="mt-auto border-t border-slate-800/80 pt-4 px-2 text-[10px] leading-relaxed text-slate-600">
        Indian-law intelligence workspace
      </p>
    </aside>
  );
}
