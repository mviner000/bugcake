// components/sheet/share-dialog/SheetMembersList.tsx

import { Id } from "../../../../convex/_generated/dataModel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GenericAccessManager, GenericAccessMember, GenericAccessRequest } from "@/components/common/share/GenericAccessManager"
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
  canManageMembers?: boolean
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
  onRoleChange,
  onRemoveUser,
  onApproveRequest,
  onDeclineRequest,
  canManageMembers = true,
}: SheetMembersListProps) {
  
  const renderAvatar = (member: GenericAccessMember<Id<"users">>) => {
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
        {member.avatarUrl && (
          <AvatarImage src={member.avatarUrl} alt={member.name} />
        )}
        <AvatarFallback className="bg-muted">
          {getInitials(member.name)}
        </AvatarFallback>
      </Avatar>
    )
  }

  const genericUsersWithAccess: GenericAccessMember<Id<"users">>[] | undefined = 
    usersWithAccess?.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isCurrentUser: user.isCurrentUser,
    }))

  const genericPendingRequests: GenericAccessRequest<Id<"permissions">, Id<"users">>[] | undefined =
    pendingRequests?.map(request => ({
      id: request.id,
      userId: request.userId,
      name: request.name,
      email: request.email,
      avatarUrl: request.avatarUrl,
      requestedRole: request.requestedRole,
      requestMessage: request.requestMessage,
      requestedAt: request.requestedAt,
    }))

  return (
    <GenericAccessManager<Id<"users">, Id<"permissions">, "viewer" | "qa_lead" | "qa_tester">
      usersWithAccess={genericUsersWithAccess}
      pendingRequests={genericPendingRequests}
      activeTab={activeTab}
      onTabChange={onTabChange}
      roleOptions={roleOptions}
      canManageMembers={canManageMembers}
      onRoleChange={onRoleChange}
      onRemoveMember={onRemoveUser}
      onApproveRequest={onApproveRequest}
      onDeclineRequest={onDeclineRequest}
      renderAvatar={renderAvatar}
      showBuiltInHeader={false}
    />
  )
}