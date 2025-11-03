// src/components/checklist/share-dialog/ChecklistAddMemberInput.tsx

import { GenericAddPeopleSection, RoleOption } from "@/components/common/share/GenericAddPeopleSection"

interface ChecklistAddMemberInputProps {
  onAddMember: (email: string, role: "qa_tester" | "qa_lead" | "viewer") => Promise<void>;
  canManageMembers: boolean;
  isLoading?: boolean; // Optional loading state
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
  isLoading = false,
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
    <GenericAddPeopleSection
      onAddPerson={handleAddPerson}
      roleOptions={checklistRoleOptions}
      defaultRole="viewer"
      isLoading={isLoading}
      visible={canManageMembers} // Hide if user can't manage members
      wrapperClassName="px-5" // Checklist-specific wrapper padding
    />
  );
}