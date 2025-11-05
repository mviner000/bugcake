// src/components/sheet/SheetShareDialog.tsx

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { GenericShareDialog, Member, PendingRequest } from "../shared/GenericShareDialog";
import { SheetDialogHeader } from "./share-dialog/SheetDialogHeader";
import { SheetAddMemberInput } from "./share-dialog/SheetAddMemberInput";
import { SheetGeneralAccess } from "./share-dialog/SheetGeneralAccess";
import { SheetMembersList } from "./share-dialog/SheetMembersList";
import { SheetDialogFooter } from "./share-dialog/SheetDialogFooter";
import { SheetPeopleAccessHeader } from "./share-dialog/SheetPeopleAccessHeader";
import { SheetRoleCount } from "./share-dialog/SheetRoleCount";
import { useMemo, useCallback } from "react";

interface SheetShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetId: Id<"sheets">;
}

/**
 * Share Dialog for Sheets
 * 
 * Manages user access and permissions for a specific sheet.
 * Integrates with the GenericShareDialog for consistent UI and behavior.
 */
export function SheetShareDialog({
  open,
  onOpenChange,
  sheetId,
}: SheetShareDialogProps) {
  const rawUsersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, { sheetId });
  const sheet = useQuery(api.myFunctions.getSheetById, { id: sheetId });
  
  const currentUser = rawUsersWithAccess?.find(u => u.isCurrentUser);
  const canManageMembers = currentUser?.role === "qa_lead" || currentUser?.role === "owner";
  
  const rawPendingRequests = useQuery(
    api.myFunctions.getPendingAccessRequests, 
    canManageMembers ? { sheetId } : "skip"
  );
  
  const addUserAccess = useMutation(api.myFunctions.addUserAccessToSheet);
  const removeUserAccess = useMutation(api.myFunctions.removeUserAccessFromSheet);
  const updateUserRole = useMutation(api.myFunctions.updatePermission);
  const updateAccessLevel = useMutation(api.myFunctions.updateSheetAccessLevel);
  const approveRequest = useMutation(api.myFunctions.approveAccessRequest);
  const declineRequest = useMutation(api.myFunctions.declineAccessRequest);

  // Check if data is still loading
  const isLoading = rawUsersWithAccess === undefined || sheet === undefined;

  // Get the actual sheet name from the database, fallback to a default if not available
  const fileName = useMemo(() => {
    return sheet?.name || "Untitled Sheet";
  }, [sheet]);

  // Transform API response to match GenericShareDialog Member interface
  const members: Member[] | undefined = useMemo(() => {
    if (!rawUsersWithAccess) {
      return undefined;
    }

    return rawUsersWithAccess.map(user => ({
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isCurrentUser: user.isCurrentUser,
    }));
  }, [rawUsersWithAccess]);

  // Transform API response to match GenericShareDialog PendingRequest interface
  const pendingRequests: PendingRequest[] | undefined = useMemo(() => {
    if (!rawPendingRequests) {
      return undefined;
    }

    return rawPendingRequests.map(request => ({
      id: request.id,
      userId: request.userId,
      name: request.name,
      email: request.email,
      avatarUrl: request.avatarUrl,
      requestedAt: request.requestedAt,
      requestMessage: request.requestMessage,
      requestedRole: request.requestedRole,
    }));
  }, [rawPendingRequests]);

  const handleAddUser = useCallback(async (email: string, role: string) => {
    try {
      await addUserAccess({
        sheetId,
        userEmail: email,
        role: role as "viewer" | "qa_lead" | "qa_tester",
      });
      
      let roleLabel = "Viewer";
      if (role === "qa_lead") roleLabel = "QA Lead";
      if (role === "qa_tester") roleLabel = "QA Tester";
      
      toast.success(`${email} has been added as ${roleLabel}`);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to add user";
      toast.error(errorMessage);
      throw error;
    }
  }, [addUserAccess, sheetId]);

  const handleRoleChange = useCallback(async (userId: string, newRole: string) => {
    try {
      await updateUserRole({
        sheetId,
        targetUserId: userId as Id<"users">,
        role: newRole as "viewer" | "qa_lead" | "qa_tester",
      });
      
      let roleLabel = "Viewer";
      if (newRole === "qa_lead") roleLabel = "QA Lead";
      if (newRole === "qa_tester") roleLabel = "QA Tester";
      
      toast.success(`Role updated to ${roleLabel}`);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update role";
      toast.error(errorMessage);
      throw error;
    }
  }, [updateUserRole, sheetId]);

  const handleRemoveUser = useCallback(async (userId: string) => {
    try {
      await removeUserAccess({
        sheetId,
        targetUserId: userId as Id<"users">,
      });
      toast.success("User removed from sheet");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to remove user";
      toast.error(errorMessage);
      throw error;
    }
  }, [removeUserAccess, sheetId]);

  const handleAccessLevelChange = useCallback(async (
    newLevel: "restricted" | "anyoneWithLink" | "public"
  ) => {
    try {
      await updateAccessLevel({
        sheetId: sheetId,
        accessLevel: newLevel
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
  }, [updateAccessLevel, sheetId]);

  const handleApproveRequest = useCallback(async (permissionId: string, requestedRole: string) => {
    try {
      let actualRole: "viewer" | "qa_lead" | "qa_tester" = "viewer";
      if (requestedRole === "editor") actualRole = "qa_lead";
      if (requestedRole === "commenter") actualRole = "qa_tester";
      
      await approveRequest({
        permissionId: permissionId as Id<"permissions">,
        finalRole: actualRole,
      });
      
      toast.success("Access request approved");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to approve request";
      toast.error(errorMessage);
      throw error;
    }
  }, [approveRequest]);

  const handleDeclineRequest = useCallback(async (permissionId: string) => {
    try {
      await declineRequest({ 
        permissionId: permissionId as Id<"permissions"> 
      });
      toast.success("Access request declined");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to decline request";
      toast.error(errorMessage);
      throw error;
    }
  }, [declineRequest]);

  const getLinkUrl = useCallback(() => {
    return `${window.location.origin}/sheet/${sheetId}`;
  }, [sheetId]);

  const currentAccessLevel = sheet?.accessLevel || "restricted";

  return (
    <GenericShareDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      entityName={fileName}
      entityId={sheetId}
      entityType="sheet"
      members={members}
      pendingRequests={pendingRequests}
      currentUserId={currentUser?.id}
      currentUserRole={currentUser?.role}
      currentAccessLevel={currentAccessLevel}
      canManageMembers={canManageMembers}
      onAddMember={handleAddUser}
      onRemoveMember={handleRemoveUser}
      onUpdateMemberRole={handleRoleChange}
      onApproveRequest={handleApproveRequest}
      onDeclineRequest={handleDeclineRequest}
      onAccessLevelChange={handleAccessLevelChange}
      getLinkUrl={getLinkUrl}
      isLoading={isLoading}
      DialogHeader={SheetDialogHeader}
      AddMemberInput={SheetAddMemberInput}
      PeopleAccessHeader={SheetPeopleAccessHeader}
      RoleCount={SheetRoleCount}
      MembersList={SheetMembersList}
      GeneralAccess={SheetGeneralAccess}
      DialogFooter={SheetDialogFooter}
      headerProps={{
        fileName: fileName,
        usersWithAccess: rawUsersWithAccess,
      }}
    />
  );
}