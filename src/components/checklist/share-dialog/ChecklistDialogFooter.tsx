// src/components/checklist/share-dialog/ChecklistDialogFooter.tsx

import { GenericShareDialogFooter } from "@/components/common/share/GenericShareDialogFooter"

interface ChecklistDialogFooterProps {
  onCopyLink: () => void
  onClose: () => void
}

/**
 * Checklist-specific footer that uses the generic component.
 * Passes through the parent's copy link handler.
 */
export function ChecklistDialogFooter({
  onCopyLink,
  onClose,
}: ChecklistDialogFooterProps) {
  return (
    <GenericShareDialogFooter
      onClose={onClose}
      onCopyLink={onCopyLink}
      showCopyButton={true}
      wrapperClassName="px-5 py-4 border-t flex items-center justify-between"
    />
  )
}