import * as React from "react"
import { Plus } from "@/lib/icons"
import { FAB, type FABProps } from "@/components/ui/fab"

type GlobalFABProps = Omit<FABProps, "icon"> & {
  icon?: React.ElementType
}

export const GlobalFAB = ({ icon = Plus, ...props }: GlobalFABProps) => {
  return <FAB icon={icon} {...props} />
}

