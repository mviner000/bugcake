// src/components/checklist/ChecklistUserRoleBadge.tsx

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { UserRole, UserRoleBadge } from "../common/UserRoleBadge"; // <-- Import the generic badge and type

interface ChecklistUserRoleBadgeProps {
  checklistId: string;
  checklistOwnerId: string;
}

/**
 * Custom hook to encapsulate the data fetching and role determination logic 
 * for a specific checklist.
 */
const useChecklistUserRole = (checklistId: string, checklistOwnerId: string) => {
  // 1. Get current user profile
  const currentUser = useQuery(api.myFunctions.getMyProfile);
  
  // 2. Get checklist members
  const members = useQuery(
    api.myFunctions.getChecklistMembers,
    // Only fetch if checklistId is available
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // 3. Determine the current user's role (using an IIFE for clarity)
  const role: UserRole | null = (() => {
    // If user data is still loading
    if (!currentUser) return null; 

    // Check 1: User is the owner
    if (currentUser._id === checklistOwnerId) {
      return "owner";
    }

    // Check 2: User is a member
    if (members && Array.isArray(members)) {
      const memberRecord = members.find(
        (member) => member.userId === currentUser._id
      );
      if (memberRecord) {
        // Cast the backend role to the UserRole type
        return memberRecord.role as UserRole; 
      }
    }

    // Check 3: Logged in but not owner/member
    return "guest";
  })();

  return role;
}

/**
 * The container component for Checklists. 
 * It determines the role and delegates the rendering to the generic badge.
 */
export function ChecklistUserRoleBadge({ 
  checklistId, 
  checklistOwnerId 
}: ChecklistUserRoleBadgeProps) {
  const role = useChecklistUserRole(checklistId, checklistOwnerId);

  // Renders the generic component, reusing all its styling.
  return <UserRoleBadge role={role} />;
}