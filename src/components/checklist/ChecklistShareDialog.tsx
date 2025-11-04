// src/components/checklist/ChecklistShareDialog.tsx

import { useState, useMemo } from "react"; // ✅ IMPORT useMemo
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { ChecklistRoleDisplay } from "./ChecklistRoleDisplay";
import { ChecklistGeneralAccess } from "./share-dialog/ChecklistGeneralAccess";
import { ChecklistPeopleAccessHeader } from "./share-dialog/ChecklistPeopleAccessHeader";
import { ChecklistDialogFooter } from "./share-dialog/ChecklistDialogFooter";
import { ChecklistMembersList } from "./share-dialog/ChecklistMembersList";
import { ChecklistRequestsList } from "./share-dialog/ChecklistRequestsList";
import { ChecklistAddMemberInput } from "./share-dialog/ChecklistAddMemberInput";
import { ChecklistDialogHeader } from "./share-dialog/ChecklistDialogHeader";

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
  const [selectedRequestRoles, setSelectedRequestRoles] = useState<Record<string, "qa_tester" | "qa_lead" | "viewer">>({});
  const [expandedRequests, setExpandedRequests] = useState<Record<string, boolean>>({});

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

  // ✅ START OF FIX
  const allMembers = useMemo(() => {
    // Wait until members are loaded
    if (!members) {
      return undefined;
    }

    // 1. Create the synthetic owner object
    // This object mimics the structure of a member object
    const ownerMember = {
      // Use checklistOwnerId as the 'id'. This is safe because
      // the GenericAccessManager renders the owner row as non-mutable,
      // so this ID will never be passed to onRemoveMember.
      id: checklistOwnerId,
      userId: checklistOwnerId,
      name: checklistOwnerEmail.split('@')[0], // Use email prefix as name
      email: checklistOwnerEmail,
      role: "owner" as const, // This is what GenericAccessManager looks for
      addedAt: 0, // Not applicable
      addedBy: "System", // Not applicable
    };

    // 2. Combine the synthetic owner with the rest of the members
    return [ownerMember, ...members];
  }, [members, checklistOwnerId, checklistOwnerEmail]);
  // ✅ END OF FIX

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
      
      setSelectedRequestRoles(prev => {
        const newRoles = { ...prev };
        delete newRoles[requestId];
        return newRoles;
      });
      setExpandedRequests(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[requestId];
        return newExpanded;
      });
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
      
      setSelectedRequestRoles(prev => {
        const newRoles = { ...prev };
        delete newRoles[requestId];
        return newRoles;
      });
      setExpandedRequests(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[requestId];
        return newExpanded;
      });
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

  // NEW: Handler for sending email invitations
  const handleSendEmail = () => {
    // You can implement email functionality here
    // For now, we'll show a toast message
    toast.info("Email invitation feature coming soon!");
    // Example implementation (uncomment when ready):
    // const subject = encodeURIComponent(`You've been invited to ${sprintName}`);
    // const body = encodeURIComponent(`Join this checklist: ${window.location.href}`);
    // window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleToggleExpand = (requestId: string) => {
    setExpandedRequests({
      ...expandedRequests,
      [requestId]: !expandedRequests[requestId],
    });
  };

  const handleSelectRole = (requestId: string, role: "qa_tester" | "qa_lead" | "viewer") => {
    setSelectedRequestRoles({
      ...selectedRequestRoles,
      [requestId]: role,
    });
  };

  const currentAccessLevel = checklist?.accessLevel || "restricted";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0">
        <ChecklistDialogHeader
          sprintName={sprintName}
          checklistId={checklistId}
          checklistOwnerId={checklistOwnerId}
        />

        <ChecklistAddMemberInput
          onAddMember={handleAddMember}
          canManageMembers={canManageMembers}
          isAddingUser={isAddingMember}
        />

        <ChecklistPeopleAccessHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCopyLink={handleCopyLink}
          canManageMembers={canManageMembers}
          pendingRequestsCount={pendingRequests?.length || 0}
        />

        <div className="px-5">
          <ChecklistRoleDisplay
            members={members} 
            includeOwner={true}
            ownerEmail={checklistOwnerEmail}
          />
        </div>

        <div className="px-5 max-h-96 overflow-y-auto">
          {activeTab === "all" ?
            (
            <ChecklistMembersList
              members={allMembers} // ✅ CHANGED: Use allMembers instead of members
              checklistOwnerEmail={checklistOwnerEmail}
              checklistOwnerId={checklistOwnerId}
              currentUserId={currentUser?._id}
              canManageMembers={canManageMembers}
              onUpdateMemberRole={handleUpdateMemberRole}
              onRemoveMember={handleRemoveMember}
              // NEW: Pass the copy link and send email handlers
              onCopyLink={handleCopyLink}
              onSendEmail={handleSendEmail}
            />
          ) : (
            <ChecklistRequestsList
              pendingRequests={pendingRequests}
              expandedRequests={expandedRequests}
              selectedRequestRoles={selectedRequestRoles}
              onToggleExpand={handleToggleExpand}
              onSelectRole={handleSelectRole}
              onApproveRequest={handleApproveRequest}
              onDeclineRequest={handleDeclineRequest}
            />
          )}
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
      </DialogContent>
    </Dialog>
  );
}