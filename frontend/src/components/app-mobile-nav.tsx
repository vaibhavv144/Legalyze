import { AnimatePresence, motion } from "framer-motion";
import { Scale, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { WorkspaceNavLinks } from "./workspace-nav-links";

type AppMobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function AppMobileNav({ open, onClose }: AppMobileNavProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-50 bg-[#0c0b0a]/40 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Workspace navigation"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,280px)] flex-col border-r border-[#e8e6e1] bg-[#f7f6f3] p-4 lg:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <Link
                to="/app/dashboard"
                onClick={onClose}
                className="group flex min-w-0 items-center gap-2.5 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-[#efece6]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#0c0b0a] text-white transition-transform duration-300 group-hover:rotate-[-8deg]">
                  <Scale className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="truncate text-[15px] font-semibold tracking-tight text-[#161513]">
                  Legalyze
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-[#161513] transition-colors hover:bg-[#efece6]"
                onClick={onClose}
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <p className="mb-3 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a39a]">
              Workspace
            </p>
            <WorkspaceNavLinks onNavigate={onClose} className="flex-1" />

            <p className="mt-4 border-t border-[#e8e6e1] px-2 pt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[#b3aea5]">
              Indian-law intelligence
            </p>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
