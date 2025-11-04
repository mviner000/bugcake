// src/components/sheet/share-dialog/SheetRoleCount.tsx

import { GenericRoleCount } from "@/components/common/share/GenericRoleCount";

interface SheetUser {
  id: any;
  name: string;
  email: string;
  role: "owner" | "viewer" | "qa_lead" | "qa_tester";
  avatarUrl?: string | null;
  isCurrentUser?: boolean;
}

interface SheetRoleCountProps {
  usersWithAccess: SheetUser[] | undefined;
}

export function SheetRoleCount({ usersWithAccess }: SheetRoleCountProps) {
  return <GenericRoleCount members={usersWithAccess} />;
}