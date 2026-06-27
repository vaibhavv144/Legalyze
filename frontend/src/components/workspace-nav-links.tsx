import { Link, useLocation } from "react-router-dom";
import { workspaceNavItems } from "../lib/nav-items";
import { cn } from "../lib/utils";

type WorkspaceNavLinksProps = {
  onNavigate?: () => void;
  className?: string;
};

export function WorkspaceNavLinks({ onNavigate, className }: WorkspaceNavLinksProps) {
  const location = useLocation();

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Workspace navigation">
      {workspaceNavItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#161513]/15",
              active
                ? "bg-[#0c0b0a] text-white"
                : "text-[#78736b] hover:bg-[#efece6] hover:text-[#161513]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
