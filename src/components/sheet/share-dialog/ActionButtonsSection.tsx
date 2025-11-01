// components/sheet/ActionButtonsSection.tsx

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionButtonsSectionProps {
  onClose: () => void
}

export function ActionButtonsSection({ onClose }: ActionButtonsSectionProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center justify-between pt-2">
      <Button variant="outline" onClick={handleCopyLink} disabled={isCopied}>
        {isCopied ? (
          <Check className="h-4 w-4 mr-2 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {isCopied ? "Copied!" : "Copy link"}
      </Button>
      <Button onClick={onClose}>Done</Button>
    </div>
  )
}