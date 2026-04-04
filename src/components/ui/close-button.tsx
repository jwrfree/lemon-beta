"use client"

import * as React from "react"
import { X } from "@/lib/icons"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CloseButtonTone = "default" | "muted" | "surface"

const toneStyles: Record<CloseButtonTone, string> = {
  default:
    "bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/70 data-[state=open]:bg-secondary",
  muted: "bg-muted text-muted-foreground hover:bg-muted/80",
  surface: "bg-card text-foreground hover:bg-card/80",
}

export interface CloseButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "variant" | "size" | "aria-label"> {
  ariaLabel?: string
  tone?: CloseButtonTone
  icon?: React.ReactNode
}

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ ariaLabel = "Tutup", tone = "default", icon, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        aria-label={ariaLabel}
        className={cn(
          "p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
          toneStyles[tone],
          className
        )}
        {...props}
      >
        {icon ?? <X className="h-4 w-4" />}
        {children}
      </Button>
    )
  }
)
CloseButton.displayName = "CloseButton"

export { CloseButton }
