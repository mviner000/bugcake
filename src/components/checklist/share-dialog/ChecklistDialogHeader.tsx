// src/components/checklist/share-dialog/ChecklistDialogHeader.tsx

import { GenericShareDialogHeader } from "@/components/common/share/GenericShareDialogHeader"
import { ChecklistUserRoleBadge } from "../ChecklistUserRoleBadge"

interface ChecklistDialogHeaderProps {
  sprintName: string
  checklistId: string
  checklistOwnerId: string
}

/**
 * Checklist-specific header that uses the generic component.
 * Displays sprint name and user role badge.
 */
export function ChecklistDialogHeader({
  sprintName,
  checklistId,
  checklistOwnerId,
}: ChecklistDialogHeaderProps) {
  return (
    <GenericShareDialogHeader
      title={sprintName}
      subtitle={
        <ChecklistUserRoleBadge 
          checklistId={checklistId}
          checklistOwnerId={checklistOwnerId}
        />
      }
      titlePrefix="Share"
      useDialogHeader={false}
      wrapperClassName="px-5 py-4"
      titleClassName="text-xl font-semibold"
    />
  )
}