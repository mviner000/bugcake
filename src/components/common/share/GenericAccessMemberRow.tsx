// components/common/share/GenericAccessMemberRow.tsx

import { X } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { RoleOption } from "./GenericAccessRequestList"; 

/**
 * Generic member data structure
 */
export interface GenericAccessMember<TId = string> {
  id: TId;
  name: string;
  email: string;
  role: string;
  isCurrentUser: boolean;
  avatarUrl?: string | null;
}

/**
 * Props for the generic member row component
 */
export interface GenericAccessMemberRowProps<TId = string> {
  /** The member data */
  member: GenericAccessMember<TId>;
  
  /** Available role options for the dropdown (excluding 'owner') */
  roleOptions: RoleOption[];
  
  /** Whether the current user has permission to manage roles and remove members */
  canManageMembers: boolean;
  
  /** Callback when member's role is changed */
  onRoleChange: (memberId: TId, newRole: string) => Promise<void> | void;
  
  /** Callback when remove button is clicked */
  onRemoveMember: (memberId: TId) => Promise<void> | void;
  
  /** Optional custom avatar renderer */
  renderAvatar?: (member: GenericAccessMember<TId>) => ReactNode;
}

/**
 * Renders a single row for a user with access, including role management controls.
 */
export function GenericAccessMemberRow<TId = string>({
  member,
  roleOptions,
  canManageMembers,
  onRoleChange,
  onRemoveMember,
  renderAvatar,
}: GenericAccessMemberRowProps<TId>) {
  // --- Avatar Renderer ---
  const defaultRenderAvatar = (person: GenericAccessMember<TId>) => {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }

    return (
      <Avatar className="h-10 w-10 flex-shrink-0">
        {person.avatarUrl ? (
          <AvatarImage src={person.avatarUrl || "/placeholder.svg"} alt={person.name} />
        ) : null}
        <AvatarFallback className="bg-muted">
          {getInitials(person.name)}
        </AvatarFallback>
      </Avatar>
    )
  }

  const avatarRenderer = renderAvatar || defaultRenderAvatar

  // --- Role Display Formatting ---
  const formatRoleDisplay = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {avatarRenderer(member)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {member.name}
            {member.isCurrentUser && <span className="text-muted-foreground font-normal"> (you)</span>}
          </p>
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canManageMembers && member.role !== 'owner' ? (
          <>
            <Select 
              value={member.role}
              onValueChange={(value) => onRoleChange(member.id, value)}
            >
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!member.isCurrentUser && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => onRemoveMember(member.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            {formatRoleDisplay(member.role)}
          </div>
        )}
      </div>
    </div>
  );
}