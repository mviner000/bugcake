// components/common/share/GenericAccessMemberRow.tsx

import { X } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// FIX: Import Avatar components statically for browser compatibility
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
  
  /** Custom styling variant */
  variant?: "sheet" | "checklist";
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
  variant = "sheet",
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

    if (variant === "sheet") {
      // FIX: Removed the require statement. Components are now imported statically at the top.
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
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
          {person.name.charAt(0).toUpperCase()}
        </div>
      )
    }
  }

  const avatarRenderer = renderAvatar || defaultRenderAvatar

  // --- Role Display Formatting ---
  const formatRoleDisplay = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // --- Sheet Variant (Shadcn UI styling) ---
  if (variant === "sheet") {
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
            // Display role text for non-managers or the current user/owner (if owner isn't filtered upstream)
            <div className={`text-sm ${member.role === 'owner' ? 'text-muted-foreground' : 'text-gray-600'}`}>
              {formatRoleDisplay(member.role)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Checklist Variant (Custom Tailwind styling) ---
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {avatarRenderer(member)}
        <div>
          <p className="text-sm font-medium">
            {member.name}
            {member.isCurrentUser && <span className="text-gray-500 font-normal"> (you)</span>}
          </p>
          <p className="text-xs text-gray-500">{member.email}</p>
        </div>
      </div>
      
      {canManageMembers && member.role !== 'owner' ? (
        <div className="flex items-center gap-2">
          <Select
            value={member.role}
            onValueChange={(v) => onRoleChange(member.id, v)}
          >
            <SelectTrigger className="w-32 h-9 text-sm">
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
            <button
              onClick={() => onRemoveMember(member.id)}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          {formatRoleDisplay(member.role)}
        </div>
      )}
    </div>
  );
}