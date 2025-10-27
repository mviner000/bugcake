// src/components/checklist/ChecklistUserRoleBadge.tsx

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface ChecklistUserRoleBadgeProps {
  checklistId: string;
  checklistOwnerId: string;
}

export function ChecklistUserRoleBadge({ 
  checklistId, 
  checklistOwnerId 
}: ChecklistUserRoleBadgeProps) {
  // Get current user
  const currentUser = useQuery(api.myFunctions.getMyProfile);
  
  // Get checklist members
  const members = useQuery(
    api.myFunctions.getChecklistMembers,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // Determine the current user's role
  const getUserRole = (): "owner" | "qa_lead" | "qa_tester" | "viewer" | null => {
    if (!currentUser) return null;

    // Check if user is the owner
    if (currentUser._id === checklistOwnerId) {
      return "owner";
    }

    // Check if user is in the members list
    if (members && Array.isArray(members)) {
      const memberRecord = members.find(
        (member) => member.userId === currentUser._id
      );
      if (memberRecord) {
        return memberRecord.role as "owner" | "qa_lead" | "qa_tester" | "viewer";
      }
    }

    // Default to viewer if they have access but no explicit role
    return "viewer";
  };

  const currentRole = getUserRole();

  // Don't render if we don't have user data yet
  if (!currentUser || currentRole === null) {
    return null;
  }

  // Role styling configuration
  const roleConfig: Record<
    "owner" | "qa_lead" | "qa_tester" | "viewer",
    { label: string; bgColor: string; textColor: string }
  > = {
    owner: {
      label: "Owner",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
    },
    qa_lead: {
      label: "QA Lead",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    qa_tester: {
      label: "QA Tester",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
    viewer: {
      label: "Viewer",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    },
  };

  const config = roleConfig[currentRole];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ml-2`}
    >
      {config.label}
    </span>
  );
}