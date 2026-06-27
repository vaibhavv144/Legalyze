import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#e8e6e1] bg-white text-[#3a3a37]",
        className,
      )}
      {...props}
    />
  );
}
