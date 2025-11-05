// src/components/checklist/share-dialog/ChecklistAddMemberInput.tsx

import { GenericAddMemberInput, RoleOption } from "@/components/common/share/GenericAddMemberInput"

interface ChecklistAddMemberInputProps {
  onAddMember: (email: string, role: "qa_tester" | "qa_lead" | "viewer") => Promise<void>;
  canManageMembers: boolean;
  isAddingUser?: boolean; // Optional loading state
}

// Define the role options for checklists
const checklistRoleOptions: RoleOption[] = [
  { value: "viewer", label: "Viewer" },
  { value: "qa_tester", label: "QA Tester" },
  { value: "qa_lead", label: "QA Lead" },
];

export function ChecklistAddMemberInput({
  onAddMember,
  canManageMembers,
  isAddingUser = false,
}: ChecklistAddMemberInputProps) {
  // Type-safe wrapper that validates the role
  const handleAddPerson = async (email: string, role: string) => {
    // Type guard to ensure role is valid
    if (role === "viewer" || role === "qa_tester" || role === "qa_lead") {
      await onAddMember(email, role);
    } else {
      console.error(`Invalid role: ${role}`);
    }
  };

  return (
    <GenericAddMemberInput
      onAddPerson={handleAddPerson}
      roleOptions={checklistRoleOptions}
      defaultRole="viewer"
      isLoading={isAddingUser}
      visible={canManageMembers} // Hide if user can't manage members
    />
  );
}