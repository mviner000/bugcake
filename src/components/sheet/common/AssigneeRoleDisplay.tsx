
// src/components/sheet/common/AssigneeRoleDisplay.tsx
interface UserForDisplay { 
  id: any
  name: string
  email: string
  role: "owner" | "viewer" | "qa_lead" | "qa_tester"
  avatarUrl: string | null | undefined 
  isCurrentUser: boolean
}

interface AssigneeRoleDisplayProps {
  usersWithAccess: UserForDisplay[] | undefined
}

export function AssigneeRoleDisplay({ usersWithAccess }: AssigneeRoleDisplayProps) {
  const validUsers = Array.isArray(usersWithAccess) ? (usersWithAccess as UserForDisplay[]) : []

  if (validUsers.length === 0) {
    return null
  }

  const roleCounts = validUsers.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const roleLabels: Record<string, string> = {
    owner: "Owner",
    qa_lead: "QA Lead",
    qa_tester: "QA Tester",
    viewer: "Viewer",
  }

  const roleDisplay = Object.entries(roleCounts)
    .map(([role, count]) => `${count} ${roleLabels[role]}${count > 1 ? "s" : ""}`)
    .join(", ")

  return <p className="text-sm text-muted-foreground mt-1">{roleDisplay}</p>
}