import { AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

export function RiskBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        severity === "high" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        severity === "medium" && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        severity === "low" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      {severity}
    </span>
  );
}
