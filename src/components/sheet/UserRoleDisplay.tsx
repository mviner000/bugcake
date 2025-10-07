// components/sheet/UserRoleDisplay.tsx

import { Badge } from "@/components/ui/badge"

interface UserRoleDisplayProps {
  usersWithAccess?: {
    id: string
    name: string
    role: string
    isCurrentUser?: boolean
  }[]
}

export function UserRoleDisplay({ usersWithAccess }: UserRoleDisplayProps) {
  if (!usersWithAccess) return null

  const currentUser = usersWithAccess.find((u) => u.isCurrentUser)
  if (!currentUser) return null

  const formattedRole =
    currentUser.role === "qa_lead"
      ? "QA Lead"
      : currentUser.role === "qa_tester"
      ? "QA Tester"
      : currentUser.role === "owner"
      ? "Owner"
      : "Viewer"

  const roleColor =
    currentUser.role === "owner"
      ? "bg-primary text-primary-foreground"
      : currentUser.role === "qa_lead"
      ? "bg-blue-500 text-white"
      : currentUser.role === "qa_tester"
      ? "bg-green-500 text-white"
      : "bg-gray-200 text-gray-800"

  return (
    <div className="flex items-center gap-2 mt-1">
      <Badge variant="secondary" className={`${roleColor} font-medium`}>
        {formattedRole}
      </Badge>
    </div>
  )
}
