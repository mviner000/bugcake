// src/components/common/share/GenericRoleCount.tsx

interface GenericMember {
  id: any;
  name: string;
  email: string;
  role: "owner" | "viewer" | "qa_lead" | "qa_tester";
  avatarUrl?: string | null;
  isCurrentUser?: boolean;
}

interface GenericRoleCountProps {
  members: GenericMember[] | undefined;
  customRoleLabels?: Record<string, string>;
  customRoleOrder?: string[];
}

export function GenericRoleCount({ 
  members,
  customRoleLabels,
  customRoleOrder,
}: GenericRoleCountProps) {
  const validMembers = Array.isArray(members) ? (members as GenericMember[]) : [];

  // Count roles from members
  const roleCounts = validMembers.reduce(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // If no roles to display, return null
  if (Object.keys(roleCounts).length === 0) {
    return null;
  }

  const defaultRoleLabels: Record<string, string> = {
    owner: "Owner",
    qa_lead: "QA Lead",
    qa_tester: "QA Tester",
    viewer: "Viewer",
  };

  const roleLabels = customRoleLabels || defaultRoleLabels;

  // Define role order for display
  const defaultRoleOrder = ["owner", "qa_lead", "qa_tester", "viewer"];
  const roleOrder = customRoleOrder || defaultRoleOrder;

  const roleDisplay = roleOrder
    .filter((role) => roleCounts[role] > 0)
    .map((role) => {
      const count = roleCounts[role];
      return `${count} ${roleLabels[role]}${count > 1 ? "s" : ""}`;
    })
    .join(", ");

  return (
    <div className="inline-flex items-center px-3 py-1 bg-black text-white text-xs rounded-full font-medium">
      {roleDisplay}
    </div>
  );
}