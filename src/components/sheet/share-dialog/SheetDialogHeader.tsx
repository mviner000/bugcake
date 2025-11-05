// components/sheet/share-dialog/SheetDialogHeader.tsx

import { GenericShareDialogHeader } from "@/components/common/share/GenericShareDialogHeader"
import { SheetUserRoleBadge } from "../SheetUserRoleBadge"
import { Id } from "../../../../convex/_generated/dataModel"

interface User {
  id: Id<"users">
  name: string
  email: string
  role: string
  avatarUrl?: string | null
  isCurrentUser: boolean
}

interface SheetDialogHeaderProps {
  fileName: string
  usersWithAccess: User[] | undefined
  sheetId: string
  sheetOwnerId: string
}

/**
 * Sheet-specific header that uses the generic component.
 * Displays file name and user role information.
 */
export function SheetDialogHeader({ 
  fileName,
  sheetId,
  sheetOwnerId 
}: SheetDialogHeaderProps) {
  return (
    <GenericShareDialogHeader
      title={fileName}
      subtitle={
        <SheetUserRoleBadge 
          sheetId={sheetId}
          sheetOwnerId={sheetOwnerId}
        />
      }
      titlePrefix="Share"
      wrapperClassName="px-5 py-4"
      titleClassName="text-xl font-semibold"
    />
  )
}