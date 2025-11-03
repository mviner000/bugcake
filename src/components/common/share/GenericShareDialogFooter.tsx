// src/components/common/share/GenericShareDialogFooter.tsx

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GenericShareDialogFooterProps {
  /** Callback when Done button is clicked */
  onClose: () => void
  
  /** Optional: Custom function to copy link. If not provided, uses current URL */
  onCopyLink?: () => void
  
  /** Optional: Show/hide the copy link button */
  showCopyButton?: boolean
  
  /** Optional: Custom text for Done button */
  doneButtonText?: string
  
  /** Optional: Custom text for Copy button */
  copyButtonText?: string
  
  /** Optional: Custom text for Copied state */
  copiedButtonText?: string
  
  /** Optional: Custom wrapper class name */
  wrapperClassName?: string
}

/**
 * Generic reusable footer for share dialogs.
 * Handles copy link functionality and close button.
 */
export function GenericShareDialogFooter({
  onClose,
  onCopyLink,
  showCopyButton = true,
  doneButtonText = "Done",
  copyButtonText = "Copy link",
  copiedButtonText = "Copied!",
  wrapperClassName = "px-5 py-4 border-t flex items-center justify-between",
}: GenericShareDialogFooterProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyLink = async () => {
    if (onCopyLink) {
      // Use custom copy function if provided
      onCopyLink()
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } else {
      // Default: copy current URL
      try {
        await navigator.clipboard.writeText(window.location.href)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (error) {
        console.error("Failed to copy link:", error)
      }
    }
  }

  return (
    <div className={wrapperClassName}>
      {showCopyButton && (
        <Button 
          variant="outline" 
          onClick={handleCopyLink} 
          disabled={isCopied}
        >
          {isCopied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {isCopied ? copiedButtonText : copyButtonText}
        </Button>
      )}
      
      {!showCopyButton && <div />}
      
      <Button onClick={onClose}>
        {doneButtonText}
      </Button>
    </div>
  )
}