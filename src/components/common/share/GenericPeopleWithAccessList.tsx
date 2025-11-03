// components/common/share/GenericPeopleWithAccessList.tsx

import { ReactNode } from "react";
import { GenericAccessMember, GenericAccessMemberRow } from "./GenericAccessMemberRow";
import { RoleOption } from "./GenericAccessRequestList";

// Export GenericAccessMember so it can be imported by other components
export type { GenericAccessMember };

/**
 * Props for the generic people with access list
 */
interface GenericPeopleWithAccessListProps {
  /** Array of users with access or undefined while loading */
  usersWithAccess: GenericAccessMember[] | undefined;
  
  /** Available role options for the dropdown (excluding 'owner') */
  roleOptions: RoleOption[];
  
  /** Whether the current user can change roles and remove members */
  canManageMembers: boolean;
  
  /** Callback when member's role is changed */
  onRoleChange: (memberId: string, newRole: string) => Promise<void> | void;
  
  /** Callback when remove button is clicked */
  onRemoveMember: (memberId: string) => Promise<void> | void;
  
  /** Optional custom avatar renderer */
  renderAvatar?: (member: GenericAccessMember) => ReactNode;
  
  /** Custom styling variant */
  variant?: "sheet" | "checklist";
}

/**
 * Generic reusable component for displaying a list of users who already have access.
 * It handles loading, empty states, and separating the owner from the mutable members.
 */
export function GenericPeopleWithAccessList({
  usersWithAccess,
  roleOptions,
  canManageMembers,
  onRoleChange,
  onRemoveMember,
  renderAvatar,
  variant = "sheet",
}: GenericPeopleWithAccessListProps) {

  // --- Loading State ---
  if (usersWithAccess === undefined) {
    if (variant === "sheet") {
      return <p className="text-sm text-muted-foreground">Loading users...</p>;
    } else {
      return (
        <div className="text-center py-4 text-sm text-gray-500">
          Loading members...
        </div>
      );
    }
  }
  
  const owner = usersWithAccess.find(p => p.role === "owner");
  const nonOwners = usersWithAccess.filter(p => p.role !== "owner");

  // --- Empty State ---
  if (usersWithAccess.length === 0) {
    if (variant === "sheet") {
      return <p className="text-sm text-muted-foreground">No users have access yet</p>;
    } else {
      return (
        <div className="text-center py-4 text-sm text-gray-500">
          No members added yet
        </div>
      );
    }
  }

  // --- Main Render ---
  return (
    <div className={variant === "sheet" ? "space-y-3" : ""}>
      {/* 1. Render Owner (View Only) */}
      {owner && (
        <>
          <GenericAccessMemberRow
            member={owner}
            roleOptions={roleOptions}
            canManageMembers={false}
            onRoleChange={onRoleChange}
            onRemoveMember={onRemoveMember}
            renderAvatar={renderAvatar}
            variant={variant}
          />
          
          {variant === "sheet" && nonOwners.length > 0 && <div className="h-px bg-border my-2" />}
        </>
      )}

      {/* 2. Render Non-Owners (with controls if allowed) */}
      {nonOwners.map((person) => (
        <GenericAccessMemberRow
          key={person.id}
          member={person}
          roleOptions={roleOptions}
          canManageMembers={canManageMembers}
          onRoleChange={onRoleChange}
          onRemoveMember={onRemoveMember}
          renderAvatar={renderAvatar}
          variant={variant}
        />
      ))}
    </div>
  );
}