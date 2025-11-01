// components/sheet/ShareModalHeader.tsx

import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

interface ShareModalHeaderProps {
  fileName: string
  usersWithAccess: User[] | undefined
}

export function ShareModalHeader({ fileName, usersWithAccess }: ShareModalHeaderProps) {
  return (
    <DialogHeader className="px-6 pt-6 pb-4 space-y-0">
      <div className="flex items-start justify-between w-full">
        <div>
          <DialogTitle className="text-xl font-normal">Share &quot;{fileName}&quot;</DialogTitle>
          <UserRoleDisplay usersWithAccess={usersWithAccess} />
        </div>
      </div>
    </DialogHeader>
  )
}