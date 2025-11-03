// components/sheet/share-dialog/SheetAddMemberInput.tsx

import { GenericAddPeopleSection, RoleOption } from "@/components/common/share/GenericAddPeopleSection"

interface SheetAddMemberInputProps {
  onAddUser: (email: string, role: "viewer" | "qa_lead" | "qa_tester") => Promise<void>
  isAddingUser: boolean
}

// Define the role options for sheets
const sheetRoleOptions: RoleOption[] = [
  { value: "viewer", label: "Viewer" },
  { value: "qa_tester", label: "QA Tester" },
  { value: "qa_lead", label: "QA Lead" },
];

export function SheetAddMemberInput({ onAddUser, isAddingUser }: SheetAddMemberInputProps) {
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
    <GenericAddPeopleSection
      onAddPerson={handleAddPerson}
      roleOptions={sheetRoleOptions}
      defaultRole="viewer"
      isLoading={isAddingUser}
      visible={true} // Always visible for sheets
      wrapperClassName="" // No wrapper padding for sheets
    />
  )
}