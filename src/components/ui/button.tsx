import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "@/lib/icons"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-title-sm ring-offset-background transition-all motion-pressable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary !text-primary-foreground hover:opacity-90 active:scale-95 shadow-sm",
        default: "bg-primary !text-primary-foreground hover:opacity-90 active:scale-95 shadow-sm",
        volt: "bg-accent !text-accent-foreground hover:opacity-90 active:scale-95 shadow-md",
        destructive:
          "bg-destructive !text-destructive-foreground hover:bg-destructive/90 active:scale-95",
        "destructive-soft":
          "bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-95",
        "primary-soft":
          "bg-primary/10 text-primary hover:bg-primary/20 active:scale-95",
        outline:
          "border border-border/40 bg-card hover:bg-accent/10 hover:text-accent-foreground active:scale-95 shadow-sm",
        secondary:
          "bg-secondary !text-secondary-foreground hover:opacity-80 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
        tertiary: "text-muted-foreground hover:text-foreground active:scale-95",
        success: "bg-success !text-success-foreground hover:opacity-90 active:scale-95",
        error: "bg-destructive !text-destructive-foreground hover:opacity-90 active:scale-95",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-14 px-10 text-body-lg",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const computedAriaLabel =
      props["aria-label"] ??
      (size === "icon" && !props["aria-labelledby"] ? props.title : undefined)
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        aria-label={computedAriaLabel}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            <span className="sr-only">Loading</span>
          </>
        ) : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
