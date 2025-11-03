// components/sheet/share-dialog/SheetDialogFooter.tsx

import { GenericShareDialogFooter } from "@/components/common/share/GenericShareDialogFooter"

interface SheetDialogFooterProps {
  onClose: () => void
}

/**
 * Sheet-specific footer that uses the generic component.
 * Customizes styling to match Sheet share modal design.
 */
export function SheetDialogFooter({ onClose }: SheetDialogFooterProps) {
  return (
    <GenericShareDialogFooter
      onClose={onClose}
      showCopyButton={true}
      wrapperClassName="flex items-center justify-between pt-2"
    />
  )
}