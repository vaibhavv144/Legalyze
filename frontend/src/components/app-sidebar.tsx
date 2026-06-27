import { Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkspaceNavLinks } from "./workspace-nav-links";

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[230px] shrink-0 flex-col border-r border-[#e8e6e1] bg-[#f7f6f3] p-4 lg:flex">
      <Link
        to="/app/dashboard"
        className="group mb-8 flex items-center gap-2.5 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-[#efece6]"
      >
        <span className="grid h-8 w-8 place-items-center rounded-md bg-[#0c0b0a] text-white transition-transform duration-300 group-hover:rotate-[-8deg]">
          <Scale className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-[#161513]">Legalyze</span>
      </Link>

      <p className="mb-3 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a39a]">
        Workspace
      </p>
      <WorkspaceNavLinks className="flex-1" />

      <p className="mt-auto border-t border-[#e8e6e1] px-2 pt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[#b3aea5]">
        Indian-law intelligence
      </p>
    </aside>
  );
}
