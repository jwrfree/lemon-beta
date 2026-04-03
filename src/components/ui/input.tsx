'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "flex h-10 w-full rounded-xl border border-transparent px-3 py-2 text-base transition-all shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-background border-border/50",
        surface: "bg-muted/50 border-transparent shadow-none focus-visible:bg-background focus-visible:border-border/30",
        secondary: "bg-secondary/40 border-transparent shadow-none",
        ghost: "bg-transparent border-transparent shadow-none px-0 py-0",
      },
      size: {
        default: "h-10",
        sm: "h-9 px-3",
        lg: "h-12 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
