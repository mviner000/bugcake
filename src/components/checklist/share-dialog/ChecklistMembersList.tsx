// src/components/checklist/share-dialog/ChecklistMembersList.tsx

import { GenericAccessManager, GenericAccessMember, GenericAccessRequest } from "@/components/common/share/GenericAccessManager";
import { RoleOption } from "@/components/common/share/GenericAccessRequestList";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "qa_tester" | "qa_lead" | "viewer" | "owner";
}

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  requestedRole: "qa_tester" | "qa_lead" | "viewer";
  requestMessage?: string;
  requestedAt: number;
}

interface ChecklistMembersListProps {
  members: Member[] | undefined;
  pendingRequests: PendingRequest[] | undefined;
  activeTab: "all" | "requests";
  onTabChange: (tab: "all" | "requests") => void;
  checklistOwnerEmail: string;
  checklistOwnerId: string;
  currentUserId: string | undefined;
  canManageMembers: boolean;
  onUpdateMemberRole: (memberId: string, newRole: "qa_tester" | "qa_lead" | "viewer") => void;
  onRemoveMember: (memberId: string) => void;
  onCopyLink: () => void;
  onSendEmail: () => void;
  onApproveRequest: (requestId: string, finalRole: "qa_tester" | "qa_lead" | "viewer") => void;
  onDeclineRequest: (requestId: string) => void;
}

const roleOptions: RoleOption[] = [
  { value: "viewer", label: "Viewer" },
  { value: "qa_tester", label: "QA Tester" },
  { value: "qa_lead", label: "QA Lead" },
];

export function ChecklistMembersList({
  members,
  pendingRequests,
  activeTab,
  onTabChange,
  currentUserId,
  canManageMembers,
  onUpdateMemberRole,
  onRemoveMember,
  onApproveRequest,
  onDeclineRequest,
}: ChecklistMembersListProps) {
  
  const genericMembers: GenericAccessMember<string>[] | undefined = 
    members?.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      isCurrentUser: currentUserId === member.id,
      avatarUrl: null,
    }));

  const genericRequests: GenericAccessRequest<string, string>[] | undefined =
    pendingRequests?.map(request => ({
      id: request.id,
      userId: request.id,
      name: request.name,
      email: request.email,
      avatarUrl: null,
      requestedRole: request.requestedRole,
      requestMessage: request.requestMessage,
      requestedAt: request.requestedAt,
    }));

  const handleApproveRequest = (requestId: string, requestedRole: string) => {
    onApproveRequest(requestId, requestedRole as "qa_tester" | "qa_lead" | "viewer");
  };

  return (
    <GenericAccessManager<string, string, "qa_tester" | "qa_lead" | "viewer">
      usersWithAccess={genericMembers}
      pendingRequests={genericRequests}
      activeTab={activeTab}
      onTabChange={onTabChange}
      roleOptions={roleOptions}
      canManageMembers={canManageMembers}
      onRoleChange={onUpdateMemberRole}
      onRemoveMember={onRemoveMember}
      onApproveRequest={handleApproveRequest}
      onDeclineRequest={onDeclineRequest}
      showBuiltInHeader={false}
    />
  );
}