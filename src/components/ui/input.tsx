'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "flex h-10 w-full rounded-xl border border-transparent px-3 py-2 text-body-lg transition-all shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-card border-border/40 shadow-sm hover:border-border/60",
        surface: "bg-card/70 border-border/20 shadow-none focus-visible:bg-card focus-visible:border-border/40",
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
