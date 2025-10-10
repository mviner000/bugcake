// src/components/sheet/common/AssigneeRoleDisplay.tsx

interface User {
  id: any
  name: string
  email: string
  role: "owner" | "viewer" | "qa_lead" | "qa_tester"
  avatarUrl: string | null
  isCurrentUser: boolean
}

interface AssigneeRoleDisplayProps {
  usersWithAccess: User[] | undefined
}

export function AssigneeRoleDisplay({ usersWithAccess }: AssigneeRoleDisplayProps) {
  if (!usersWithAccess || usersWithAccess.length === 0) {
    return null
  }

  const roleCounts = usersWithAccess.reduce(
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
