import { cn } from "../lib/utils";

const styles: Record<string, string> = {
  critical: "bg-[#2a0d0c] text-[#ffd9d6]",
  high: "bg-[#fbeae9] text-[#9f2f2d]",
  medium: "bg-[#fbf3db] text-[#956400]",
  low: "bg-[#ecf3ec] text-[#346538]",
};

export function RiskBadge({ severity }: { severity: "low" | "medium" | "high" | "critical" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide",
        styles[severity],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {severity}
    </span>
  );
}
