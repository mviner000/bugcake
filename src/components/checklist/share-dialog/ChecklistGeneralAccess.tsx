// src/components/checklist/share-dialog/ChecklistGeneralAccess.tsx

import { Lock, Link, Globe } from "lucide-react";
import { 
  GenericGeneralAccessSection, 
  AccessLevelOption 
} from "@/components/common/share/GenericGeneralAccessSection";

// ✅ FIXED: Props now use camelCase consistently
interface ChecklistGeneralAccessProps {
  generalAccess: "restricted" | "anyoneWithLink" | "public";
  onAccessChange: (value: "restricted" | "anyoneWithLink" | "public") => void;
  canManageMembers: boolean;
}

// ✅ FIXED: Define the specific access levels with camelCase
const checklistAccessLevels: AccessLevelOption[] = [
  {
    value: "restricted",
    label: "Restricted",
    description: "Only people with access can open with the link",
    icon: Lock,
  },
  {
    value: "anyoneWithLink", // ✅ Changed to camelCase
    label: "Anyone with the link",
    description: "Anyone with the link can access",
    icon: Link,
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

  return (
    <GenericGeneralAccessSection
      currentValue={generalAccess}
      onValueChange={(value) => onAccessChange(value as "restricted" | "anyoneWithLink" | "public")}
      accessLevels={checklistAccessLevels}
      disabled={!canManageMembers}
      wrapperClassName="py-3 border-t space-y-3"
    />
  );
}