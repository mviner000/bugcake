// src/components/common/share/GenericShareDialogHeader.tsx

import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReactNode } from "react"

interface GenericShareDialogHeaderProps {
  /** The title text to display (e.g., file name or sprint name) */
  title: string
  
  /** Optional: Custom component to render below the title (e.g., role badges) */
  subtitle?: ReactNode
  
  /** Optional: Prefix text before the title */
  titlePrefix?: string
  
  /** Optional: Custom wrapper class name */
  wrapperClassName?: string
  
  /** Optional: Custom title class name */
  titleClassName?: string
  
}

/**
 * Generic reusable header for share dialogs.
 * Can be customized for different features (sheets, checklists, etc.)
 */
export function GenericShareDialogHeader({
  title,
  subtitle,
  titlePrefix = "Share",
  wrapperClassName = "px-6 pt-6 pb-4",
  titleClassName = "text-xl font-normal",
}: GenericShareDialogHeaderProps) {
  const titleContent = (
    <>
      <DialogTitle className={titleClassName}>
        {titlePrefix} &quot;{title}&quot;
      </DialogTitle>
      {subtitle && <div className="mt-1">{subtitle}</div>}
    </>
  )

  return (
      <DialogHeader className={`${wrapperClassName} space-y-0`}>
        <div className="flex items-start justify-between w-full">
          <div>{titleContent}</div>
        </div>
      </DialogHeader>
  )
}