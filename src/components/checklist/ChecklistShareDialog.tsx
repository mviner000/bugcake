// src/components/checklist/ChecklistShareDialog.tsx

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { ChecklistGeneralAccess } from "./share-dialog/ChecklistGeneralAccess";
import { ChecklistPeopleAccessHeader } from "./share-dialog/ChecklistPeopleAccessHeader";
import { ChecklistDialogFooter } from "./share-dialog/ChecklistDialogFooter";
import { ChecklistMembersList } from "./share-dialog/ChecklistMembersList";
import { ChecklistAddMemberInput } from "./share-dialog/ChecklistAddMemberInput";
import { ChecklistDialogHeader } from "./share-dialog/ChecklistDialogHeader";
import { ChecklistRoleCount } from "./share-dialog/ChecklistRoleCount";

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

export function ChecklistShareDialog({
  isOpen,
  onClose,
  checklistId,
  checklistOwnerId,
  checklistOwnerEmail,
  sprintName,
  currentUserRole,
}: ChecklistShareDialogProps) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");

  const checklist = useQuery(
    api.myFunctions.getChecklistById,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );
  const members = useQuery(
    api.myFunctions.getChecklistMembers,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );
  const pendingRequests = useQuery(
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

  const allMembers = useMemo(() => {
    // Wait until members are loaded
    if (!members) {
      return undefined;
    }

    // Create the synthetic owner object
    const ownerMember = {
      id: checklistOwnerId,
      userId: checklistOwnerId,
      name: checklistOwnerEmail.split('@')[0],
      email: checklistOwnerEmail,
      role: "owner" as const,
      addedAt: 0,
      addedBy: "System",
    };

    // Combine the synthetic owner with the rest of the members
    return [ownerMember, ...members];
  }, [members, checklistOwnerId, checklistOwnerEmail]);

  const handleAddMember = async (email: string, role: "qa_tester" | "qa_lead" | "viewer") => {
    setIsAddingMember(true);
    try {
      const result = await addMember({
        checklistId: checklistId as Id<"checklists">,
        memberEmail: email,
        role: role,
      });
      toast.success(`${result.member.name} has been added to the checklist.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add member.");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember({
        checklistId: checklistId as Id<"checklists">,
        memberId: memberId,
      });
      toast.success("Member has been removed from the checklist.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member.");
    }
  };

  const handleUpdateMemberRole = async (
    memberId: string,
    newRole: "qa_tester" | "qa_lead" | "viewer"
  ) => {
    try {
      await updateMemberRole({
        checklistId: checklistId as Id<"checklists">,
        memberId: memberId,
        newRole: newRole,
      });
      toast.success(`Member role has been updated to ${newRole}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role.");
    }
  };

  const handleApproveRequest = async (requestId: string, finalRole: "qa_tester" | "qa_lead" | "viewer") => {
    try {
      await approveRequest({
        requestId: requestId as Id<"checklistAccessRequests">,
        finalRole: finalRole,
      });
      toast.success("Access request approved successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve request.");
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineRequest({
        requestId: requestId as Id<"checklistAccessRequests">,
      });
      toast.success("Access request declined.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to decline request.");
    }
  };

  const handleAccessLevelChange = async (
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
      toast.error(error.message || "Failed to update access level");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Checklist link has been copied to clipboard.");
    });
  };

  const handleSendEmail = () => {
    toast.info("Email invitation feature coming soon!");
  };

  const currentAccessLevel = checklist?.accessLevel || "restricted";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[520px] p-0 gap-0">
        <ChecklistDialogHeader
          sprintName={sprintName}
          checklistId={checklistId}
          checklistOwnerId={checklistOwnerId}
        />

        <div className="px-6 pb-6 space-y-6">
          <ChecklistAddMemberInput
            onAddMember={handleAddMember}
            canManageMembers={canManageMembers}
            isAddingUser={isAddingMember}
          />

          <div>
            <ChecklistPeopleAccessHeader
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCopyLink={handleCopyLink}
              onSendEmail={handleSendEmail}
              canManageMembers={canManageMembers}
              pendingRequestsCount={pendingRequests?.length || 0}
            />

            <ChecklistRoleCount members={allMembers} />

            <ChecklistMembersList
              members={allMembers}
              pendingRequests={pendingRequests}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              checklistOwnerEmail={checklistOwnerEmail}
              checklistOwnerId={checklistOwnerId}
              currentUserId={currentUser?._id}
              canManageMembers={canManageMembers}
              onUpdateMemberRole={handleUpdateMemberRole}
              onRemoveMember={handleRemoveMember}
              onCopyLink={handleCopyLink}
              onSendEmail={handleSendEmail}
              onApproveRequest={handleApproveRequest}
              onDeclineRequest={handleDeclineRequest}
            />
          </div>

          <ChecklistGeneralAccess
            generalAccess={currentAccessLevel}
            onAccessChange={handleAccessLevelChange}
            canManageMembers={canManageMembers}
          />

          <ChecklistDialogFooter
            onCopyLink={handleCopyLink}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}