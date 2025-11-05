// src/components/checklist/ChecklistShareDialog.tsx

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { GenericShareDialog, Member, PendingRequest } from "../shared/GenericShareDialog";
import { ChecklistGeneralAccess } from "./share-dialog/ChecklistGeneralAccess";
import { ChecklistPeopleAccessHeader } from "./share-dialog/ChecklistPeopleAccessHeader";
import { ChecklistDialogFooter } from "./share-dialog/ChecklistDialogFooter";
import { ChecklistMembersList } from "./share-dialog/ChecklistMembersList";
import { ChecklistAddMemberInput } from "./share-dialog/ChecklistAddMemberInput";
import { ChecklistDialogHeader } from "./share-dialog/ChecklistDialogHeader";
import { ChecklistRoleCount } from "./share-dialog/ChecklistRoleCount";
import { useMemo, useCallback } from "react";

type UserRole = "qa_lead" | "qa_tester" | "owner" | "viewer" | "guest" | undefined;

interface ChecklistShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  checklistId: string;
  checklistOwnerId: string;
  checklistOwnerEmail: string;
  sprintName: string;
  currentUserRole: UserRole;
}

/**
 * Share Dialog for Checklists
 * 
 * Manages member access and permissions for a specific checklist.
 * Integrates with the GenericShareDialog for consistent UI and behavior.
 */
export function ChecklistShareDialog({
  isOpen,
  onClose,
  checklistId,
  checklistOwnerId,
  checklistOwnerEmail,
  sprintName,
  currentUserRole,
}: ChecklistShareDialogProps) {
  const checklist = useQuery(
    api.myFunctions.getChecklistById,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );
  const rawMembers = useQuery(
    api.myFunctions.getChecklistMembers,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );
  const rawPendingRequests = useQuery(
    api.myFunctions.getPendingChecklistAccessRequests,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );
  const currentUser = useQuery(api.myFunctions.getMyProfile);

  const addMember = useMutation(api.myFunctions.addChecklistMember);
  const removeMember = useMutation(api.myFunctions.removeChecklistMember);
  const updateMemberRole = useMutation(api.myFunctions.updateChecklistMemberRole);
  const approveRequest = useMutation(api.myFunctions.approveChecklistAccessRequest);
  const declineRequest = useMutation(api.myFunctions.declineChecklistAccessRequest);
  const updateAccessLevel = useMutation(api.myFunctions.updateChecklistAccessLevel);

  const canManageMembers = currentUserRole === "owner" || currentUserRole === "qa_lead";

  // Check if data is still loading
  const isLoading = checklist === undefined || rawMembers === undefined;

  // Create synthetic owner member and combine with regular members
  const allMembers: Member[] | undefined = useMemo(() => {
    if (!rawMembers) {
      return undefined;
    }

    // Transform API response to match GenericShareDialog Member interface
    const transformedMembers: Member[] = rawMembers.map(member => ({
      id: member.id,
      userId: member.userId,
      name: member.name,
      email: member.email,
      role: member.role,
      addedAt: member.addedAt,
      addedBy: member.addedBy,
    }));

    // Add synthetic owner member at the beginning
    const ownerMember: Member = {
      id: checklistOwnerId,
      userId: checklistOwnerId,
      name: checklistOwnerEmail.split('@')[0],
      email: checklistOwnerEmail,
      role: "owner",
      addedAt: 0,
      addedBy: "System",
    };

    return [ownerMember, ...transformedMembers];
  }, [rawMembers, checklistOwnerId, checklistOwnerEmail]);

  // Transform API response to match GenericShareDialog PendingRequest interface
  const pendingRequests: PendingRequest[] | undefined = useMemo(() => {
    if (!rawPendingRequests) {
      return undefined;
    }

    return rawPendingRequests.map(request => ({
      id: request.id,
      requesterId: request.requesterId,
      name: request.name,
      email: request.email,
      avatarUrl: request.avatarUrl,
      requestedAt: request.requestedAt,
      requestMessage: request.requestMessage,
      requestedRole: request.requestedRole,
    }));
  }, [rawPendingRequests]);

  const handleAddMember = useCallback(async (email: string, role: string) => {
    try {
      const result = await addMember({
        checklistId: checklistId as Id<"checklists">,
        memberEmail: email,
        role: role as "qa_tester" | "qa_lead" | "viewer",
      });
      toast.success(`${result.member.name} has been added to the checklist.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add member.";
      toast.error(errorMessage);
      throw error;
    }
  }, [addMember, checklistId]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    try {
      await removeMember({
        checklistId: checklistId as Id<"checklists">,
        memberId: memberId,
      });
      toast.success("Member has been removed from the checklist.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove member.";
      toast.error(errorMessage);
      throw error;
    }
  }, [removeMember, checklistId]);

  const handleUpdateMemberRole = useCallback(async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole({
        checklistId: checklistId as Id<"checklists">,
        memberId: memberId,
        newRole: newRole as "qa_tester" | "qa_lead" | "viewer",
      });
      toast.success(`Member role has been updated to ${newRole}.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update role.";
      toast.error(errorMessage);
      throw error;
    }
  }, [updateMemberRole, checklistId]);

  const handleApproveRequest = useCallback(async (requestId: string, finalRole: string) => {
    try {
      await approveRequest({
        requestId: requestId as Id<"checklistAccessRequests">,
        finalRole: finalRole as "qa_tester" | "qa_lead" | "viewer",
      });
      toast.success("Access request approved successfully.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve request.";
      toast.error(errorMessage);
      throw error;
    }
  }, [approveRequest]);

  const handleDeclineRequest = useCallback(async (requestId: string) => {
    try {
      await declineRequest({
        requestId: requestId as Id<"checklistAccessRequests">,
      });
      toast.success("Access request declined.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to decline request.";
      toast.error(errorMessage);
      throw error;
    }
  }, [declineRequest]);

  const handleAccessLevelChange = useCallback(async (
    newLevel: "restricted" | "anyoneWithLink" | "public"
  ) => {
    try {
      await updateAccessLevel({
        checklistId: checklistId as Id<"checklists">,
        accessLevel: newLevel,
      });
      let levelLabel = "Restricted";
      if (newLevel === "anyoneWithLink") levelLabel = "Anyone with the link";
      if (newLevel === "public") levelLabel = "Public";

      toast.success(`General access updated to "${levelLabel}"`);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update access level";
      toast.error(errorMessage);
      throw error;
    }
  }, [updateAccessLevel, checklistId]);

  const getLinkUrl = useCallback(() => {
    return window.location.href;
  }, []);

  const currentAccessLevel = checklist?.accessLevel || "restricted";

  return (
    <GenericShareDialog
      isOpen={isOpen}
      onClose={onClose}
      entityName={sprintName}
      entityId={checklistId}
      entityType="checklist"
      members={allMembers}
      pendingRequests={pendingRequests}
      currentUserId={currentUser?._id}
      currentUserRole={currentUserRole}
      currentAccessLevel={currentAccessLevel}
      canManageMembers={canManageMembers}
      onAddMember={handleAddMember}
      onRemoveMember={handleRemoveMember}
      onUpdateMemberRole={handleUpdateMemberRole}
      onApproveRequest={handleApproveRequest}
      onDeclineRequest={handleDeclineRequest}
      onAccessLevelChange={handleAccessLevelChange}
      getLinkUrl={getLinkUrl}
      isLoading={isLoading}
      DialogHeader={ChecklistDialogHeader}
      AddMemberInput={ChecklistAddMemberInput}
      PeopleAccessHeader={ChecklistPeopleAccessHeader}
      RoleCount={ChecklistRoleCount}
      MembersList={ChecklistMembersList}
      GeneralAccess={ChecklistGeneralAccess}
      DialogFooter={ChecklistDialogFooter}
      headerProps={{
        sprintName: sprintName,
        checklistId: checklistId,
        checklistOwnerId: checklistOwnerId,
      }}
    />
  );
}