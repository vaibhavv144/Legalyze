import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-700/85 bg-[#071126]/90 text-slate-100 shadow-[0_18px_50px_rgba(2,6,23,0.42)] backdrop-blur-md ring-1 ring-white/[0.03]",
        className,
      )}
      {...props}
    />
  );
}
