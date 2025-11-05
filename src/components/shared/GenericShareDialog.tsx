// src/components/shared/GenericShareDialog.tsx

import { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

/**
 * Represents a member with access to an entity (checklist or sheet)
 */
export interface Member {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: string;
  addedAt?: number;
  addedBy?: string;
  isCurrentUser?: boolean;
  avatarUrl?: string | null | undefined;
}

/**
 * Represents a pending access request
 */
export interface PendingRequest {
  id: string;
  userId?: string;
  requesterId?: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  requestedAt: number;
  requestMessage: string;
  requestedRole: string;
}

/**
 * Props for the GenericShareDialog component
 * @template TRole - The role type for the specific entity (e.g., "qa_lead" | "qa_tester" | "viewer")
 */
export interface GenericShareDialogProps<TRole extends string = string> {
  // Dialog state
  isOpen: boolean;
  onClose: () => void;
  
  // Entity info
  entityName: string;
  entityId: string;
  entityType: "checklist" | "sheet";
  
  // Members data
  members?: Member[];
  pendingRequests?: PendingRequest[];
  currentUserId?: string;
  currentUserRole?: TRole;
  
  // Access level
  currentAccessLevel: "restricted" | "anyoneWithLink" | "public";
  
  // Permissions
  canManageMembers: boolean;
  
  // Actions
  onAddMember: (email: string, role: string) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onUpdateMemberRole: (memberId: string, newRole: string) => Promise<void>;
  onApproveRequest: (requestId: string, finalRole: string) => Promise<void>;
  onDeclineRequest: (requestId: string) => Promise<void>;
  onAccessLevelChange: (newLevel: "restricted" | "anyoneWithLink" | "public") => Promise<void>;
  
  // Link generation
  getLinkUrl: () => string;
  
  // Toast messages (optional customization)
  messages?: {
    linkCopied?: string;
    emailInviteComingSoon?: string;
  };
  
  // Custom components
  DialogHeader: React.ComponentType<any>;
  AddMemberInput: React.ComponentType<any>;
  PeopleAccessHeader: React.ComponentType<any>;
  RoleCount: React.ComponentType<any>;
  MembersList: React.ComponentType<any>;
  GeneralAccess: React.ComponentType<any>;
  DialogFooter: React.ComponentType<any>;
  
  // Additional props to pass to custom components
  headerProps?: Record<string, any>;
  
  // Loading state
  isLoading?: boolean;
}

/**
 * Generic Share Dialog Component
 * 
 * A reusable dialog for managing member access to entities (checklists or sheets).
 * Uses component composition pattern to allow complete UI customization while
 * maintaining consistent behavior.
 * 
 * @example
 * ```tsx
 * <GenericShareDialog
 *   isOpen={true}
 *   onClose={handleClose}
 *   entityType="checklist"
 *   members={members}
 *   onAddMember={handleAdd}
 *   DialogHeader={CustomHeader}
 *   // ... other props
 * />
 * ```
 */
export function GenericShareDialog<TRole extends string = string>({
  isOpen,
  onClose,
  entityType,
  members,
  pendingRequests,
  currentUserId,
  currentAccessLevel,
  canManageMembers,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onApproveRequest,
  onDeclineRequest,
  onAccessLevelChange,
  getLinkUrl,
  messages = {},
  DialogHeader,
  AddMemberInput,
  PeopleAccessHeader,
  RoleCount,
  MembersList,
  GeneralAccess,
  DialogFooter,
  headerProps = {},
  isLoading = false,
}: GenericShareDialogProps<TRole>) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");

  // Memoize members to prevent unnecessary re-renders
  const memoizedMembers = useMemo(() => members, [members]);
  const memoizedPendingRequests = useMemo(() => pendingRequests, [pendingRequests]);

  const handleAddMember = useCallback(async (email: string, role: string) => {
    setIsAddingMember(true);
    try {
      await onAddMember(email, role);
    } catch (error) {
      console.error("Failed to add member:", error);
      throw error;
    } finally {
      setIsAddingMember(false);
    }
  }, [onAddMember]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    try {
      await onRemoveMember(memberId);
    } catch (error) {
      console.error("Failed to remove member:", error);
      throw error;
    }
  }, [onRemoveMember]);

  const handleUpdateMemberRole = useCallback(async (memberId: string, newRole: string) => {
    try {
      await onUpdateMemberRole(memberId, newRole);
    } catch (error) {
      console.error("Failed to update member role:", error);
      throw error;
    }
  }, [onUpdateMemberRole]);

  const handleApproveRequest = useCallback(async (requestId: string, finalRole: string) => {
    try {
      await onApproveRequest(requestId, finalRole);
    } catch (error) {
      console.error("Failed to approve request:", error);
      throw error;
    }
  }, [onApproveRequest]);

  const handleDeclineRequest = useCallback(async (requestId: string) => {
    try {
      await onDeclineRequest(requestId);
    } catch (error) {
      console.error("Failed to decline request:", error);
      throw error;
    }
  }, [onDeclineRequest]);

  const handleAccessLevelChange = useCallback(async (
    newLevel: "restricted" | "anyoneWithLink" | "public"
  ) => {
    try {
      await onAccessLevelChange(newLevel);
    } catch (error) {
      console.error("Failed to change access level:", error);
      throw error;
    }
  }, [onAccessLevelChange]);

  const handleCopyLink = useCallback(() => {
    const link = getLinkUrl();
    
    navigator.clipboard.writeText(link).then(() => {
      const defaultMessage = `${entityType === "checklist" ? "Checklist" : "Sheet"} link has been copied to clipboard.`;
      toast.success(messages.linkCopied || defaultMessage);
    }).catch((error) => {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link to clipboard.");
    });
  }, [getLinkUrl, entityType, messages.linkCopied]);

  const handleSendEmail = useCallback(() => {
    toast.info(messages.emailInviteComingSoon || "Email invitation feature coming soon!");
  }, [messages.emailInviteComingSoon]);

  // Show loading state if data is still being fetched
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[520px] p-0 gap-0">
          <div className="px-6 py-8 flex items-center justify-center">
            <div className="text-center text-muted-foreground">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[520px] p-0 gap-0">
        <DialogHeader {...headerProps} />

        <div className="px-6 pb-6 space-y-6">
          <AddMemberInput
            onAddMember={handleAddMember}
            onAddUser={handleAddMember}
            canManageMembers={canManageMembers}
            isAddingUser={isAddingMember}
            isAddingMember={isAddingMember}
          />

          <div>
            <PeopleAccessHeader
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCopyLink={handleCopyLink}
              onSendEmail={handleSendEmail}
              canManageMembers={canManageMembers}
              showTabs={canManageMembers}
              pendingRequestsCount={memoizedPendingRequests?.length || 0}
            />

            <RoleCount 
              members={memoizedMembers}
              usersWithAccess={memoizedMembers}
            />

            <MembersList
              members={memoizedMembers}
              usersWithAccess={memoizedMembers}
              pendingRequests={memoizedPendingRequests}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              currentUserId={currentUserId}
              canManageMembers={canManageMembers}
              onUpdateMemberRole={handleUpdateMemberRole}
              onRoleChange={handleUpdateMemberRole}
              onRemoveMember={handleRemoveMember}
              onRemoveUser={handleRemoveMember}
              onCopyLink={handleCopyLink}
              onSendEmail={handleSendEmail}
              onApproveRequest={handleApproveRequest}
              onDeclineRequest={handleDeclineRequest}
            />
          </div>

          <GeneralAccess
            generalAccess={currentAccessLevel}
            currentAccessLevel={currentAccessLevel}
            onAccessChange={handleAccessLevelChange}
            onAccessLevelChange={handleAccessLevelChange}
            canManageMembers={canManageMembers}
          />

          <DialogFooter
            onCopyLink={handleCopyLink}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}