// src/components/checklist/share-dialog/ChecklistMembersList.tsx

// UPDATED: Import GenericAccessManager and GenericAccessMember from the single source
import { GenericAccessManager, GenericAccessMember } from "@/components/common/share/GenericAccessManager";
import { RoleOption } from "@/components/common/share/GenericAccessRequestList";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "qa_tester" | "qa_lead" | "viewer" | "owner";
}

interface ChecklistMembersListProps {
  members: Member[] | undefined;
  checklistOwnerEmail: string;
  checklistOwnerId: string;
  currentUserId: string | undefined;
  canManageMembers: boolean;
  onUpdateMemberRole: (memberId: string, newRole: "qa_tester" | "qa_lead" | "viewer") => void;
  onRemoveMember: (memberId: string) => void;
}

const roleOptions: RoleOption[] = [
    { value: "viewer", label: "Viewer" },
    { value: "qa_tester", label: "QA Tester" },
    { value: "qa_lead", label: "QA Lead" },
];

const renderChecklistAvatar = (person: GenericAccessMember<string>) => {
    const initial = person.name.charAt(0).toUpperCase();
    return (
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
        {initial}
      </div>
    );
};

export function ChecklistMembersList({
  members,
  currentUserId,
  canManageMembers,
  onUpdateMemberRole,
  onRemoveMember,
}: ChecklistMembersListProps) {
  
  // Transform local Member array to generic format
  const genericMembersWithAccess: GenericAccessMember<string>[] | undefined = 
    members?.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      avatarUrl: undefined,
      isCurrentUser: currentUserId === member.id,
    }));

  return (
    // Use GenericAccessManager for all member list needs
    <GenericAccessManager<string, string, "qa_tester" | "qa_lead" | "viewer">
      // 1. Keep checklist variant for styling consistency
      variant="checklist" 
      usersWithAccess={genericMembersWithAccess}
      
      // 2. Omitting 'pendingRequests' prevents the "Requests" tab from appearing

      canManageMembers={canManageMembers}
      roleOptions={roleOptions}
      onRoleChange={onUpdateMemberRole}
      onRemoveMember={onRemoveMember}
      renderAvatar={renderChecklistAvatar}

      // 3. Provide NO-OP functions for request-related handlers (required by interface, ignored in practice)
      onTabChange={() => {}} 
      onApproveRequest={() => {}} 
      onDeclineRequest={() => {}}
    />
  );
}