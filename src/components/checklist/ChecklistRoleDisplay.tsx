// src/components/checklist/ChecklistRoleDisplay.tsx

interface ChecklistMember {
  id: any;
  name: string;
  email: string;
  role: "owner" | "viewer" | "qa_lead" | "qa_tester";
  avatarUrl?: string | null;
  isCurrentUser?: boolean;
}

interface ChecklistRoleDisplayProps {
  members: ChecklistMember[] | undefined;
  includeOwner?: boolean;
  ownerEmail?: string;
}

export function ChecklistRoleDisplay({ 
  members, 
  includeOwner = false,
}: ChecklistRoleDisplayProps) {
  const validMembers = Array.isArray(members) ? (members as ChecklistMember[]) : [];

  // Count roles from members
  const roleCounts = validMembers.reduce(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Add owner to counts if includeOwner is true
  if (includeOwner) {
    roleCounts["owner"] = (roleCounts["owner"] || 0) + 1;
  }

  // If no roles to display, return null
  if (Object.keys(roleCounts).length === 0) {
    return null;
  }

  const roleLabels: Record<string, string> = {
    owner: "Owner",
    qa_lead: "QA Lead",
    qa_tester: "QA Tester",
    viewer: "Viewer",
  };

  // Define role order for display
  const roleOrder = ["owner", "qa_lead", "qa_tester", "viewer"];

  const roleDisplay = roleOrder
    .filter((role) => roleCounts[role] > 0)
    .map((role) => {
      const count = roleCounts[role];
      return `${count} ${roleLabels[role]}${count > 1 ? "s" : ""}`;
    })
    .join(", ");

  return (
    <span className="inline-block bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
      {roleDisplay}
    </span>
  );
}