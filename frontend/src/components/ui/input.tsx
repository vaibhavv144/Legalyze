import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-[#e8e6e1] bg-white px-3.5 text-sm text-[#161513] outline-none transition-all placeholder:text-[#a8a39a] focus:border-[#0c0b0a] focus:ring-2 focus:ring-[#161513]/10 disabled:cursor-not-allowed disabled:bg-[#f7f6f3] disabled:text-[#78736b]",
        className,
      )}
      {...props}
    />
  );
}
