import { GenericPeopleWithAccessList, GenericAccessMember } from "@/components/common/share/GenericPeopleWithAccessList";
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

export function ChecklistMembersList({
  members,
  currentUserId,
  canManageMembers,
  onUpdateMemberRole,
  onRemoveMember,
}: ChecklistMembersListProps) {
  
  const genericMembersWithAccess: GenericAccessMember[] | undefined = members?.map(member => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    avatarUrl: undefined,
    isCurrentUser: currentUserId === member.id,
  }));

  const renderChecklistAvatar = (person: GenericAccessMember) => {
    const initial = person.name.charAt(0).toUpperCase();
    return (
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
        {initial}
      </div>
    );
  };

  return (
    <GenericPeopleWithAccessList
      variant="checklist"
      usersWithAccess={genericMembersWithAccess}
      roleOptions={roleOptions}
      canManageMembers={canManageMembers}
      onRoleChange={onUpdateMemberRole as (id: string, role: string) => void}
      onRemoveMember={onRemoveMember as (id: string) => void}
      renderAvatar={renderChecklistAvatar}
    />
  );
}