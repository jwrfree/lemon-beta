import * as React from "react"
import { Plus } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GlobalFABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
}

export const GlobalFAB = React.forwardRef<HTMLButtonElement, GlobalFABProps>(
  ({ className, icon = <Plus className="h-7 w-7" />, ...props }, ref) => {
    return (
      <div className={cn("fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden", className)}>
        <Button
          size="icon"
          ref={ref}
          className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 transition-transform active:scale-95"
          {...props}
        >
          {icon}
        </Button>
      </div>
    )
  }
)
GlobalFAB.displayName = "GlobalFAB"

