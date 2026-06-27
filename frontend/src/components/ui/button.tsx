import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-semibold antialiased transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#161513]/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#0c0b0a] text-white hover:bg-[#2f2c28]",
        secondary:
          "border border-[#e8e6e1] bg-white text-[#161513] hover:border-[#d6d3cc] hover:bg-[#f6f4ef]",
        ghost: "text-[#3a3a37] hover:bg-[#f1efea] hover:text-[#161513]",
        danger: "bg-[#9f2f2d] text-white hover:bg-[#8a2826]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: Props) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
