// src/components/sheet/share-dialog/SheetDialogFooter.tsx

import { GenericShareDialogFooter } from "@/components/common/share/GenericShareDialogFooter"

interface SheetDialogFooterProps {
  onCopyLink: () => void
  onClose: () => void
}

/**
 * Sheet-specific footer that uses the generic component.
 * Passes through the parent's copy link handler.
 * Customizes styling to match Sheet share modal design.
 */
export function SheetDialogFooter({ 
  onCopyLink,
  onClose 
}: SheetDialogFooterProps) {
  return (
    <GenericShareDialogFooter
      onClose={onClose}
      onCopyLink={onCopyLink}
      showCopyButton={true}
      wrapperClassName="flex items-center justify-between pt-2"
    />
  )
}