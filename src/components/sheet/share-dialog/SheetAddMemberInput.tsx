// components/sheet/share-dialog/SheetAddMemberInput.tsx

import { GenericAddMemberInput, RoleOption } from "@/components/common/share/GenericAddMemberInput"

interface SheetAddMemberInputProps {
  onAddUser: (email: string, role: "viewer" | "qa_lead" | "qa_tester") => Promise<void>
  isAddingUser: boolean
  canManageMembers?: boolean // NEW: Optional prop (defaults to true for backwards compatibility)
}

// Define the role options for sheets
const sheetRoleOptions: RoleOption[] = [
  { value: "viewer", label: "Viewer" },
  { value: "qa_tester", label: "QA Tester" },
  { value: "qa_lead", label: "QA Lead" },
];

export function SheetAddMemberInput({ 
  onAddUser, 
  isAddingUser,
  canManageMembers = true // NEW: Default to true (always show if not specified)
}: SheetAddMemberInputProps) {
  // Type-safe wrapper that validates the role
  const handleAddPerson = async (email: string, role: string) => {
    // Type guard to ensure role is valid
    if (role === "viewer" || role === "qa_lead" || role === "qa_tester") {
      await onAddUser(email, role);
    } else {
      console.error(`Invalid role: ${role}`);
    }
  };

  return (
    <GenericAddMemberInput
      onAddPerson={handleAddPerson}
      roleOptions={sheetRoleOptions}
      defaultRole="viewer"
      isLoading={isAddingUser}
      visible={canManageMembers} // NEW: Now controlled by canManageMembers prop
      wrapperClassName="" // No wrapper padding for sheets
    />
  )
}