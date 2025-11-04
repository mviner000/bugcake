// components/sheet/share-dialog/SheetDialogHeader.tsx

import { GenericShareDialogHeader } from "@/components/common/share/GenericShareDialogHeader"
import { UserRoleDisplay } from "../UserRoleDisplay"
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
}

/**
 * Sheet-specific header that uses the generic component.
 * Displays file name and user role information.
 */
export function SheetDialogHeader({ fileName, usersWithAccess }: SheetDialogHeaderProps) {
  return (
    <GenericShareDialogHeader
      title={fileName}
      subtitle={
        <UserRoleDisplay usersWithAccess={usersWithAccess} />
      }
      titlePrefix="Share"
      useDialogHeader={true}
      wrapperClassName="px-6 pt-6 pb-4"
      titleClassName="text-xl font-semibold"
    />
  )
}