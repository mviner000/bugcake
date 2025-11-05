// components/common/share/GenericAccessManager.tsx

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { GenericAccessMemberRow } from "./GenericAccessMemberRow";
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
 * Generic access request structure
 */
export interface GenericAccessRequest<TRequestId = string, TUserId = string> {
  id: TRequestId;
  userId: TUserId;
  name: string;
  email: string;
  avatarUrl?: string | null;
  requestedRole: string;
  requestMessage?: string;
  requestedAt: number;
}

/**
 * Props for the header section (optional)
 */
interface HeaderProps {
  activeTab: "all" | "requests";
  onTabChange: (tab: "all" | "requests") => void;
  onCopyLink?: () => void;
  onSendEmail?: () => void;
  pendingRequestsCount: number;
}

/**
 * Props for request item rendering
 */
interface RequestItemProps<TRequestId, TUserId> {
  request: GenericAccessRequest<TRequestId, TUserId>;
  onApprove: (requestId: TRequestId, requestedRole: string) => void;
  onDecline: (requestId: TRequestId) => void;
  renderAvatar?: (member: GenericAccessMember<TUserId>) => ReactNode;
}

/**
 * Main props for GenericAccessManager
 */
export interface GenericAccessManagerProps<TUserId = string, TRequestId = string, TRole extends string = string> {
  /** Array of users with access */
  usersWithAccess: GenericAccessMember<TUserId>[] | undefined;
  
  /** Array of pending access requests (optional) */
  pendingRequests?: GenericAccessRequest<TRequestId, TUserId>[] | undefined;
  
  /** Current active tab */
  activeTab?: "all" | "requests";
  
  /** Tab change handler */
  onTabChange: (tab: "all" | "requests") => void;
  
  /** Copy link handler (optional) */
  onCopyLink?: () => void;
  
  /** Send email handler (optional) */
  onSendEmail?: () => void;
  
  /** Available role options for the dropdown */
  roleOptions: RoleOption[];
  
  /** Whether the current user can manage members */
  canManageMembers: boolean;
  
  /** Callback when member's role is changed */
  onRoleChange: (memberId: TUserId, newRole: TRole) => Promise<void> | void;
  
  /** Callback when remove button is clicked */
  onRemoveMember: (memberId: TUserId) => Promise<void> | void;
  
  /** Callback when access request is approved (optional) */
  onApproveRequest?: (requestId: TRequestId, requestedRole: string) => void;
  
  /** Callback when access request is declined (optional) */
  onDeclineRequest?: (requestId: TRequestId) => void;
  
  /** Optional custom avatar renderer */
  renderAvatar?: (member: GenericAccessMember<TUserId>) => ReactNode;
  
  /** 
   * Optional custom header renderer 
   * Pass null or () => null to hide the header completely
   * Pass undefined (default) to use the built-in header
   */
  renderHeader?: ((props: HeaderProps) => ReactNode) | null;
  
  /** Optional custom request item renderer */
  renderRequestItem?: (props: RequestItemProps<TRequestId, TUserId>) => ReactNode;
  
  /** 
   * Whether to show the built-in header (tabs + buttons + role summary)
   * Set to false if you're using an external header component
   * @default true
   */
  showBuiltInHeader?: boolean;
}

/**
 * Default request item renderer - unified styling
 */
function DefaultRequestItem<TRequestId, TUserId>({ 
  request, 
  onApprove, 
  onDecline, 
  renderAvatar 
}: RequestItemProps<TRequestId, TUserId>) {
  
  const formatRoleDisplay = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const avatarElement = renderAvatar ? renderAvatar({
    id: request.userId,
    name: request.name,
    email: request.email,
    role: request.requestedRole,
    isCurrentUser: false,
    avatarUrl: request.avatarUrl
  }) : null;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {avatarElement}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{request.name}</p>
            <p className="text-xs text-muted-foreground truncate">{request.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Requested: <span className="font-medium">{formatRoleDisplay(request.requestedRole)}</span>
            </p>
            {request.requestMessage && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                "{request.requestMessage}"
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onApprove(request.id, request.requestedRole)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDecline(request.id)}
          >
            Decline
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Generic Access Manager Component
 * Handles both member list and access request management with unified styling
 */
export function GenericAccessManager<TUserId = string, TRequestId = string, TRole extends string = string>({
  usersWithAccess,
  pendingRequests,
  activeTab = "all",
  onTabChange,
  onCopyLink,
  onSendEmail,
  roleOptions,
  canManageMembers,
  onRoleChange,
  onRemoveMember,
  onApproveRequest,
  onDeclineRequest,
  renderAvatar,
  renderHeader,
  renderRequestItem,
  showBuiltInHeader = true,
}: GenericAccessManagerProps<TUserId, TRequestId, TRole>) {
  
  const RequestItemComponent = renderRequestItem || DefaultRequestItem;

  // --- MEMBER LIST LOGIC ---
  const renderMembersList = () => {
    // Loading State
    if (usersWithAccess === undefined) {
      return <p className="text-sm text-muted-foreground">Loading users...</p>;
    }
    
    const owner = usersWithAccess.find(p => p.role === "owner");
    const nonOwners = usersWithAccess.filter(p => p.role !== "owner");
  
    // Empty State
    if (usersWithAccess.length === 0) {
      return <p className="text-sm text-muted-foreground">No users have access yet</p>;
    }

    // Main Render
    return (
      <div className="space-y-3">
        {/* Render Owner (View Only) */}
        {owner && (
          <>
            <GenericAccessMemberRow
              member={owner}
              roleOptions={roleOptions}
              canManageMembers={false}
              onRoleChange={onRoleChange as (memberId: TUserId, newRole: string) => void}
              onRemoveMember={onRemoveMember}
              renderAvatar={renderAvatar}
            />
            {nonOwners.length > 0 && <div className="h-px bg-border my-2" />}
          </>
        )}
  
        {/* Render Non-Owners (with controls if allowed) */}
        {nonOwners.map((person) => (
          <GenericAccessMemberRow
            key={String(person.id)}
            member={person}
            roleOptions={roleOptions}
            canManageMembers={canManageMembers}
            onRoleChange={onRoleChange as (memberId: TUserId, newRole: string) => void}
            onRemoveMember={onRemoveMember}
            renderAvatar={renderAvatar}
          />
        ))}
      </div>
    );
  };

  // --- Determine what header to show ---
  let headerElement: ReactNode = null;
  
  if (showBuiltInHeader) {
    // Check if renderHeader is explicitly null (hide header)
    if (renderHeader === null) {
      headerElement = null;
    }
    // Check if renderHeader is a function (custom header)
    else if (typeof renderHeader === 'function') {
      headerElement = renderHeader({
        activeTab,
        onTabChange,
        onCopyLink,
        onSendEmail,
        pendingRequestsCount: pendingRequests?.length || 0,
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      {headerElement}

      {/* Content Section */}
      <div className="space-y-3">
        {activeTab === "all" ? (
          // Members List
          renderMembersList()
        ) : (
          // Requests List
          canManageMembers && onApproveRequest && onDeclineRequest ? (
            <div className="space-y-3">
              {pendingRequests === undefined ? (
                <p className="text-sm text-muted-foreground">Loading requests...</p>
              ) : pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests</p>
              ) : (
                pendingRequests.map((request) => (
                  <RequestItemComponent
                    key={String(request.id)}
                    request={request}
                    onApprove={onApproveRequest}
                    onDecline={onDeclineRequest}
                    renderAvatar={renderAvatar}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                You don't have permission to view access requests
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}