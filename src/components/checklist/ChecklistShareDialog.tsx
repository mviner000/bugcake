// src/components/checklist/ChecklistShareDialog.tsx

import { useState } from "react";
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
import { ChecklistMembersDialogFooter } from "./share-dialog/ChecklistMembersDialogFooter";
import { ChecklistMembersList } from "./share-dialog/ChecklistMembersList";
import { ChecklistRequestsList } from "./share-dialog/ChecklistRequestsList";
import { ChecklistAddMemberInput } from "./share-dialog/ChecklistAddMemberInput";
import { ChecklistMembersDialogHeader } from "./share-dialog/ChecklistMembersDialogHeader";

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
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"qa_tester" | "qa_lead" | "viewer">("viewer");
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");
  const [isCopied, setIsCopied] = useState(false);
  const [selectedRequestRoles, setSelectedRequestRoles] = useState<Record<string, "qa_tester" | "qa_lead" | "viewer">>({});
  const [expandedRequests, setExpandedRequests] = useState<Record<string, boolean>>({});

  // Fetch the full checklist document to get its current accessLevel
  const checklist = useQuery(
    api.myFunctions.getChecklistById,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // Fetch members from database
  const members = useQuery(
    api.myFunctions.getChecklistMembers,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // Fetch pending access requests
  const pendingRequests = useQuery(
    api.myFunctions.getPendingChecklistAccessRequests,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // Fetch current user
  const currentUser = useQuery(api.myFunctions.getMyProfile);

  // Mutations
  const addMember = useMutation(api.myFunctions.addChecklistMember);
  const removeMember = useMutation(api.myFunctions.removeChecklistMember);
  const updateMemberRole = useMutation(api.myFunctions.updateChecklistMemberRole);
  const approveRequest = useMutation(api.myFunctions.approveChecklistAccessRequest);
  const declineRequest = useMutation(api.myFunctions.declineChecklistAccessRequest);
  
  // Add the new mutation
  const updateAccessLevel = useMutation(api.myFunctions.updateChecklistAccessLevel);

  // Determine permissions
  const canManageMembers = currentUserRole === "owner" || currentUserRole === "qa_lead";

  // Handle add member
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    try {
      const result = await addMember({
        checklistId: checklistId as Id<"checklists">,
        memberEmail: newMemberEmail.trim(),
        role: newMemberRole,
      });

      toast.success(`${result.member.name} has been added to the checklist.`);
      setNewMemberEmail("");
      setNewMemberRole("viewer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add member.");
    }
  };

  // Handle remove member
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

  // Handle update member role
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

  // Handle approve request
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

  // Handle decline request
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

  // Add the handler for changing access level
  const handleAccessLevelChange = async (
    newLevel: "restricted" | "anyone_with_link" | "public"
  ) => {
    try {
      await updateAccessLevel({
        checklistId: checklistId as Id<"checklists">,
        accessLevel: newLevel,
      });

      // Get a user-friendly label for the success message
      let levelLabel = "Restricted";
      if (newLevel === "anyone_with_link") levelLabel = "Anyone with the link";
      if (newLevel === "public") levelLabel = "Public";

      // Show success toast
      toast.success(`General access updated to "${levelLabel}"`);
      
    } catch (error: any) {
      // Show error toast
      toast.error(error.message || "Failed to update access level");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
      toast.success("Checklist link has been copied to clipboard.");
      setTimeout(() => setIsCopied(false), 2000);
    });
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

  // Get the current access level from the fetched checklist data
  const currentAccessLevel = checklist?.accessLevel || "restricted";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0">
        {/* Header */}
        <ChecklistMembersDialogHeader
          sprintName={sprintName}
          checklistId={checklistId}
          checklistOwnerId={checklistOwnerId}
        />

        {/* Add Member Input - Only show if user can manage members */}
        <ChecklistAddMemberInput
          newMemberEmail={newMemberEmail}
          newMemberRole={newMemberRole}
          onEmailChange={setNewMemberEmail}
          onRoleChange={setNewMemberRole}
          onAddMember={handleAddMember}
          canManageMembers={canManageMembers}
        />

        {/* People with access header */}
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

        {/* Members List / Requests List */}
        <div className="px-5 max-h-96 overflow-y-auto">
          {activeTab === "all" ? (
            <ChecklistMembersList
              members={members}
              checklistOwnerEmail={checklistOwnerEmail}
              checklistOwnerId={checklistOwnerId}
              currentUserId={currentUser?._id}
              canManageMembers={canManageMembers}
              onUpdateMemberRole={handleUpdateMemberRole}
              onRemoveMember={handleRemoveMember}
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

        {/* General access section */}
        <ChecklistGeneralAccess
          generalAccess={currentAccessLevel}
          onAccessChange={handleAccessLevelChange}
          canManageMembers={canManageMembers}
        />

        {/* Footer */}
        <ChecklistMembersDialogFooter
          isCopied={isCopied}
          onCopyLink={handleCopyLink}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}