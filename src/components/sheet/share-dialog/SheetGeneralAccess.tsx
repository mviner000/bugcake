// components/sheet/share-dialog/SheetGeneralAccess.tsx

import { Lock, LinkIcon, Globe } from "lucide-react"
// Import the new generic component and its type definition
import { 
  GenericGeneralAccessSection, 
  AccessLevelOption 
} from "@/components/common/share/GenericGeneralAccessSection" // Adjust this path as needed

// Props remain unchanged to maintain the existing API
interface SheetGeneralAccessProps {
  currentAccessLevel: string
  onAccessLevelChange: (level: "restricted" | "anyoneWithLink" | "public") => void
}

// Define the specific access levels for "sheets"
const sheetAccessLevels: AccessLevelOption[] = [
  {
    value: "restricted",
    label: "Restricted",
    description: "Only people with access can open with the link",
    icon: Lock,
  },
  {
    value: "anyoneWithLink", // Note the camelCase value
    label: "Anyone with the link",
    description: "Anyone with the link can access",
    icon: LinkIcon, // Note the specific LinkIcon
  },
  {
    value: "public",
    label: "Public",
    description: "Anyone on the internet can find and access",
    icon: Globe,
  },
]

export function SheetGeneralAccess({
  currentAccessLevel,
  onAccessLevelChange,
}: SheetGeneralAccessProps) {
  
  // Render the generic component, passing in sheet-specific data
  return (
    <GenericGeneralAccessSection
      currentValue={currentAccessLevel}
      onValueChange={(value) => onAccessLevelChange(value as "restricted" | "anyoneWithLink" | "public")}
      accessLevels={sheetAccessLevels}
      disabled={false} // This component version did not have a disabled state
      wrapperClassName="space-y-3" // This component's specific wrapper style
    />
  )
}