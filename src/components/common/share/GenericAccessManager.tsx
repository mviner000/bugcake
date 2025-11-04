// components/common/share/GenericAccessManager.tsx

import { ReactNode } from "react";
// FIX: Static imports for browser compatibility
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

import { GenericAccessMemberRow } from "./GenericAccessMemberRow"; 
import { RoleOption } from "./GenericAccessRequestList";

/**
 * Generic member data structure (MOVED HERE from GenericMembersList)
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
  variant: "sheet" | "checklist";
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
  onTabChange?: (tab: "all" | "requests") => void;
  
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
  
  /** Custom styling variant */
  variant?: "sheet" | "checklist";
  
  /** Optional custom header renderer */
  renderHeader?: (props: HeaderProps) => ReactNode;
  
  /** Optional custom request item renderer */
  renderRequestItem?: (props: RequestItemProps<TRequestId, TUserId>) => ReactNode;
}

/**
 * Default header renderer for sheet variant
 */
function DefaultSheetHeader({ 
  activeTab, 
  onTabChange, 
  onCopyLink, 
  onSendEmail, 
  pendingRequestsCount 
}: HeaderProps) {
  
  // FIX: This wrapper function explicitly casts the generic 'string' 
  // from the Tabs component back to the expected literal type.
  const handleTabChange = (value: string) => {
    onTabChange(value as "all" | "requests");
  };
  
  return (
    <div className="space-y-3">
      {/* Use the fixed handleTabChange function */}
      <Tabs value={activeTab} onValueChange={handleTabChange}> 
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Members</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Requests
            {pendingRequestsCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-destructive rounded-full">
                {pendingRequestsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {(onCopyLink || onSendEmail) && (
        <div className="flex gap-2">
          {onCopyLink && (
            <Button variant="outline" size="sm" onClick={onCopyLink}>
              Copy Link
            </Button>
          )}
          {onSendEmail && (
            <Button size="sm" onClick={onSendEmail}>
              Send Email
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Default header renderer for checklist variant
 */
function DefaultChecklistHeader({ 
  activeTab, 
  onTabChange, 
  onCopyLink, 
  onSendEmail, 
  pendingRequestsCount 
}: HeaderProps) {
  // FIX: Although the checklist header's buttons use constants, 
  // we add the same wrapper for robustness if the UI changes.
  const handleTabChange = (tab: "all" | "requests") => {
    onTabChange(tab);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 border-b">
        <button
          onClick={() => handleTabChange("all")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All Members
        </button>
        <button
          onClick={() => handleTabChange("requests")}
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
            activeTab === "requests"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Requests
          {pendingRequestsCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {(onCopyLink || onSendEmail) && (
        <div className="flex gap-2">
          {onCopyLink && (
            <button
              onClick={onCopyLink}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Copy Link
            </button>
          )}
          {onSendEmail && (
            <button
              onClick={onSendEmail}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Send Email
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Default request item renderer for sheet variant
 */
function DefaultSheetRequestItem<TRequestId, TUserId>({ 
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
 * Default request item renderer for checklist variant
 */
function DefaultChecklistRequestItem<TRequestId, TUserId>({ 
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
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {avatarElement}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{request.name}</p>
            <p className="text-xs text-gray-500 truncate">{request.email}</p>
            <p className="text-xs text-gray-600 mt-1">
              Requested: <span className="font-medium">{formatRoleDisplay(request.requestedRole)}</span>
            </p>
            {request.requestMessage && (
              <p className="text-xs text-gray-500 mt-1 italic">
                "{request.requestMessage}"
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(request.id, request.requestedRole)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => onDecline(request.id)}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Generic Access Manager Component
 * Handles both member list and access request management with customizable styling
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
  variant = "sheet",
  renderHeader,
  renderRequestItem,
}: GenericAccessManagerProps<TUserId, TRequestId, TRole>) {
  
  // Determine if we should show tabs/header
  const showTabs = canManageMembers && pendingRequests !== undefined && onTabChange;
  const showHeader = onCopyLink || onSendEmail || showTabs;

  // Select default renderers based on variant
  const defaultHeaderRenderer = variant === "sheet" ? DefaultSheetHeader : DefaultChecklistHeader;
  const defaultRequestRenderer = variant === "sheet" ? DefaultSheetRequestItem : DefaultChecklistRequestItem;

  const HeaderComponent = renderHeader || defaultHeaderRenderer;
  const RequestItemComponent = renderRequestItem || defaultRequestRenderer;

  // --- MEMBER LIST LOGIC (Integrated from GenericMembersList.tsx) ---
  const renderMembersList = () => {
    // Loading State
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
  
    // Empty State
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

    // Main Render
    return (
      <div className={variant === "sheet" ? "space-y-3" : ""}>
        {/* 1. Render Owner (View Only) */}
        {owner && (
          <>
            <GenericAccessMemberRow
              member={owner}
              roleOptions={roleOptions}
              canManageMembers={false}
              onRoleChange={onRoleChange as (memberId: TUserId, newRole: string) => void}
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
            key={String(person.id)}
            member={person}
            roleOptions={roleOptions}
            canManageMembers={canManageMembers}
            onRoleChange={onRoleChange as (memberId: TUserId, newRole: string) => void}
            onRemoveMember={onRemoveMember}
            renderAvatar={renderAvatar}
            variant={variant}
          />
        ))}
      </div>
    );
  };
  // --- END MEMBER LIST LOGIC ---


  return (
    <div className="space-y-4">
      {/* Header Section */}
      {showHeader && showTabs && (
        <HeaderComponent
          activeTab={activeTab}
          onTabChange={onTabChange}
          onCopyLink={onCopyLink}
          onSendEmail={onSendEmail}
          pendingRequestsCount={pendingRequests?.length || 0}
        />
      )}

      {/* Content Section */}
      <div className={variant === "sheet" ? "space-y-3" : ""}>
        {activeTab === "all" ? (
          // Members List
          renderMembersList() // Calling the integrated function
        ) : (
          // Requests List
          canManageMembers && onApproveRequest && onDeclineRequest ? (
            <div className={variant === "sheet" ? "space-y-3" : "space-y-3"}>
              {pendingRequests === undefined ? (
                variant === "sheet" ? (
                  <p className="text-sm text-muted-foreground">Loading requests...</p>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">Loading requests...</div>
                )
              ) : pendingRequests.length === 0 ? (
                variant === "sheet" ? (
                  <p className="text-sm text-muted-foreground">No pending requests</p>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-500">No pending requests</div>
                )
              ) : (
                pendingRequests.map((request) => (
                  <RequestItemComponent
                    key={String(request.id)}
                    request={request}
                    onApprove={onApproveRequest}
                    onDecline={onDeclineRequest}
                    renderAvatar={renderAvatar}
                    variant={variant}
                  />
                ))
              )}
            </div>
          ) : (
            <div className={variant === "sheet" ? "text-center py-8" : "text-center py-8"}>
              <p className={variant === "sheet" ? "text-sm text-muted-foreground" : "text-sm text-gray-500"}>
                You don't have permission to view access requests
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}