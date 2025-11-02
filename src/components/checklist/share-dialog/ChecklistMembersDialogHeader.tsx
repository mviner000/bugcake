// src/components/checklist/share-dialog/ChecklistMembersDialogHeader.tsx

import { DialogTitle } from "@/components/ui/dialog";
import { ChecklistUserRoleBadge } from "../ChecklistUserRoleBadge";

interface ChecklistMembersDialogHeaderProps {
  sprintName: string;
  checklistId: string;
  checklistOwnerId: string;
}

export function ChecklistMembersDialogHeader({
  sprintName,
  checklistId,
  checklistOwnerId,
}: ChecklistMembersDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <div className="flex flex-col gap-1">
        <DialogTitle className="text-lg font-semibold">
          Share "{sprintName}"
        </DialogTitle>
        <div>
          <ChecklistUserRoleBadge 
            checklistId={checklistId}
            checklistOwnerId={checklistOwnerId}
          />
        </div>
      </div>
    </div>
  );
}