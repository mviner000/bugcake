// src/components/sheet/SheetUserRoleBadge.tsx

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { UserRole, GenericUserRoleBadge } from "../common/share/GenericUserRoleBadge"; // <-- Import the generic badge and type

interface SheetUserRoleBadgeProps {
  sheetId: string;
  sheetOwnerId: string;
}

/**
 * Custom hook to encapsulate the data fetching and role determination logic 
 * for a specific sheet (assumes getSheetMembers exists).
 */
const useSheetUserRole = (sheetId: string, sheetOwnerId: string) => {
  // 1. Get current user profile
  const currentUser = useQuery(api.myFunctions.getMyProfile);
  
  // 2. Get sheet members (using the getSheetMembers API from your original file)
  const members = useQuery(
    api.myFunctions.getSheetMembers,
    sheetId ? { sheetId: sheetId as Id<"sheets"> } : "skip"
  );

  // 3. Determine the current user's role
  const role: UserRole | null = (() => {
    if (!currentUser) return null; 

    // Check 1: User is the owner
    if (currentUser._id === sheetOwnerId) {
      return "owner";
    }

    // Check 2: User is a member
    if (members && Array.isArray(members)) {
      const memberRecord = members.find(
        (member) => member.userId === currentUser._id
      );
      if (memberRecord) {
        return memberRecord.role as UserRole; 
      }
    }

    // Check 3: Logged in but not owner/member
    return "guest";
  })();

  return role;
}

/**
 * The container component for Sheets. 
 * It determines the role and delegates the rendering to the generic badge.
 */
export function SheetUserRoleBadge({ 
  sheetId, 
  sheetOwnerId 
}: SheetUserRoleBadgeProps) {
  const role = useSheetUserRole(sheetId, sheetOwnerId);

  // Renders the generic component, reusing all its styling.
  return <GenericUserRoleBadge role={role} />;
}