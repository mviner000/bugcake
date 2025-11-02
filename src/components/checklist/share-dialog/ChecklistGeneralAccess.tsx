// src/components/checklist/share-dialog/ChecklistGeneralAccess.tsx

import { Lock, Link, Globe } from "lucide-react";
// Import the new generic component and its type definition
import { 
  GenericGeneralAccessSection, 
  AccessLevelOption 
} from "@/components/common/share/GenericGeneralAccessSection"; // Adjust this path as needed

// Props remain unchanged to maintain the existing API
interface ChecklistGeneralAccessProps {
  generalAccess: "restricted" | "anyone_with_link" | "public";
  onAccessChange: (value: "restricted" | "anyone_with_link" | "public") => void;
  canManageMembers: boolean;
}

// Define the specific access levels for "checklists"
const checklistAccessLevels: AccessLevelOption[] = [
  {
    value: "restricted",
    label: "Restricted",
    description: "Only people with access can open with the link",
    icon: Lock,
  },
  {
    value: "anyone_with_link", // Note the snake_case value
    label: "Anyone with the link",
    description: "Anyone with the link can access",
    icon: Link, // Note the specific Link icon
  },
  {
    value: "public",
    label: "Public",
    description: "Anyone on the internet can find and access",
    icon: Globe,
  },
];

export function ChecklistGeneralAccess({
  generalAccess,
  onAccessChange,
  canManageMembers,
}: ChecklistGeneralAccessProps) {

  // Render the generic component, passing in checklist-specific data
  return (
    <GenericGeneralAccessSection
      currentValue={generalAccess}
      onValueChange={(value) => onAccessChange(value as "restricted" | "anyone_with_link" | "public")}
      accessLevels={checklistAccessLevels}
      disabled={!canManageMembers} // Pass the disabled state
      wrapperClassName="px-5 py-3 border-t space-y-3" // This component's specific wrapper style
    />
  );
}