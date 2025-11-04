// components/sheet/share-dialog/SheetMembersList.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Id } from "../../../../convex/_generated/dataModel"
import { SheetRequestList } from "./SheetRequestList"
import { SheetPeopleAccessHeader } from "./SheetPeopleAccessHeader"
import { GenericPeopleWithAccessList, GenericAccessMember } from "@/components/common/share/GenericPeopleWithAccessList"
import { RoleOption } from "@/components/common/share/GenericAccessRequestList"

interface User {
  id: Id<"users">
  name: string
  email: string
  role: string
  avatarUrl?: string | null
  isCurrentUser: boolean
}

interface AccessRequest {
  id: Id<"permissions">
  userId: Id<"users">
  name: string
  email: string
  avatarUrl?: string | null
  requestedRole: "viewer" | "qa_lead" | "qa_tester"
  requestMessage?: string
  requestedAt: number
}

interface SheetMembersListProps {
  usersWithAccess: User[] | undefined
  pendingRequests: AccessRequest[] | undefined
  activeTab: "all" | "requests"
  onTabChange: (tab: "all" | "requests") => void
  onCopyLink: () => void
  onSendEmail: () => void
  onRoleChange: (userId: Id<"users">, newRole: "viewer" | "qa_lead" | "qa_tester") => void
  onRemoveUser: (userId: Id<"users">) => void
  onApproveRequest: (permissionId: Id<"permissions">, requestedRole: string) => void
  onDeclineRequest: (permissionId: Id<"permissions">) => void
  canManageMembers?: boolean // NEW: Add permission prop
}

const roleOptions: RoleOption[] = [
    { value: "viewer", label: "Viewer" },
    { value: "qa_tester", label: "QA Tester" },
    { value: "qa_lead", label: "QA Lead" },
];

export function SheetMembersList({
  usersWithAccess,
  pendingRequests,
  activeTab,
  onTabChange,
  onCopyLink,
  onSendEmail,
  onRoleChange,
  onRemoveUser,
  onApproveRequest,
  onDeclineRequest,
  canManageMembers = true, // NEW: Default to true for backwards compatibility
}: SheetMembersListProps) {
  
  const genericUsersWithAccess: GenericAccessMember[] | undefined = usersWithAccess?.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isCurrentUser: user.isCurrentUser,
  }))

  const renderSheetAvatar = (person: GenericAccessMember) => {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }

    return (
      <Avatar className="h-10 w-10 flex-shrink-0">
        {person.avatarUrl ? (
          <AvatarImage src={person.avatarUrl || "/placeholder.svg"} alt={person.name} />
        ) : null}
        <AvatarFallback className="bg-muted">
          {getInitials(person.name)}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <div className="space-y-4">
      <SheetPeopleAccessHeader
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCopyLink={onCopyLink}
        onSendEmail={onSendEmail}
        pendingRequestsCount={pendingRequests?.length || 0}
        showTabs={canManageMembers} // NEW: Hide tabs if user can't manage members
      />

      <div className="space-y-3">
        {activeTab === "all" ? (
          <GenericPeopleWithAccessList
            variant="sheet"
            usersWithAccess={genericUsersWithAccess}
            roleOptions={roleOptions}
            canManageMembers={canManageMembers} // NEW: Pass permission down
            onRoleChange={onRoleChange as (id: string, role: string) => void}
            onRemoveMember={onRemoveUser as (id: string) => void}
            renderAvatar={renderSheetAvatar}
          />
        ) : (
          // NEW: Only show requests if user has permission
          canManageMembers ? (
            <SheetRequestList
              pendingRequests={pendingRequests}
              onApproveRequest={onApproveRequest}
              onDeclineRequest={onDeclineRequest}
            />
          ) : null
        )}
      </div>
    </div>
  )
}