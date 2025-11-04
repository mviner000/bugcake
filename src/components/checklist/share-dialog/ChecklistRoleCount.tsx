// src/components/checklist/share-dialog/ChecklistRoleCount.tsx

import { GenericRoleCount } from "@/components/common/share/GenericRoleCount";

interface ChecklistMember {
  id: any;
  name: string;
  email: string;
  role: "owner" | "viewer" | "qa_lead" | "qa_tester";
  avatarUrl?: string | null;
  isCurrentUser?: boolean;
}

interface ChecklistRoleCountProps {
  members: ChecklistMember[] | undefined;
}

export function ChecklistRoleCount({ members }: ChecklistRoleCountProps) {
  return <GenericRoleCount members={members} />;
}