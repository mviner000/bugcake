// src/components/checklist/ChecklistMembersDialog.tsx

import { useState } from "react";
import { Link, Mail, X, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { ChecklistRoleDisplay } from "./ChecklistRoleDisplay";
import { ChecklistUserRoleBadge } from "./ChecklistUserRoleBadge";

type UserRole = "qa_lead" | "qa_tester" | "owner" | "viewer" | "guest" | undefined;

interface ChecklistMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  checklistId: string;
  checklistOwnerId: string;
  checklistOwnerEmail: string;
  sprintName: string;
  currentUserRole: UserRole;
}

export function ChecklistMembersDialog({
  isOpen,
  onClose,
  checklistId,
  checklistOwnerId,
  checklistOwnerEmail,
  sprintName,
  currentUserRole,
}: ChecklistMembersDialogProps) {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"qa_tester" | "qa_lead" | "viewer">("viewer");
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");
  const [isCopied, setIsCopied] = useState(false);

  // Fetch members from database
  const members = useQuery(
    api.myFunctions.getChecklistMembers,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // Fetch current user
  const currentUser = useQuery(api.myFunctions.getMyProfile);

  // Mutations
  const addMember = useMutation(api.myFunctions.addChecklistMember);
  const removeMember = useMutation(api.myFunctions.removeChecklistMember);
  const updateMemberRole = useMutation(api.myFunctions.updateChecklistMemberRole);

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

      // Clear the form
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
      toast.success("Checklist link has been copied to clipboard.");
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Helper function to format role display
  const formatRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      owner: "Owner",
      qa_lead: "QA Lead",
      qa_tester: "QA Tester",
      viewer: "Viewer",
    };
    return roleMap[role] || role;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-semibold">
              Share "{sprintName}"
            </DialogTitle>
            <ChecklistUserRoleBadge 
              checklistId={checklistId}
              checklistOwnerId={checklistOwnerId}
            />
          </div>
        </div>

        {/* Owner Badge */}
        <div className="px-5 pt-3">
          <ChecklistRoleDisplay
            members={members} 
            includeOwner={true}
            ownerEmail={checklistOwnerEmail}
          />
        </div>

        {/* Add Member Input - Only show if user can manage members */}
        {canManageMembers && (
          <div className="px-5 pt-3">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Add people by email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddMember();
                }}
              />
              <Select value={newMemberRole} onValueChange={(v: any) => setNewMemberRole(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="qa_tester">QA Tester</SelectItem>
                  <SelectItem value="qa_lead">QA Lead</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddMember} disabled={!newMemberEmail.trim()}>
                Add
              </Button>
            </div>
          </div>
        )}

        {/* People with access header */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">People with access</h3>
            <div className="flex items-center gap-3">
              <button 
                className="text-gray-600 hover:text-gray-800"
                onClick={handleCopyLink}
              >
                <Link className="w-5 h-5" />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs - Only show if user can manage members */}
          {canManageMembers && (
            <div className="grid grid-cols-2 border rounded-lg overflow-hidden mb-3">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-2 text-sm font-medium ${
                  activeTab === "all"
                    ? "bg-white border-b-2 border-black"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-2 text-sm font-medium ${
                  activeTab === "requests"
                    ? "bg-white border-b-2 border-black"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                Requests
              </button>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="px-5 py-3 max-h-96 overflow-y-auto">
          {/* Owner */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                {checklistOwnerEmail.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {checklistOwnerEmail.split("@")[0]}
                  {currentUser?._id === checklistOwnerId && " (you)"}
                </p>
                <p className="text-xs text-gray-500">{checklistOwnerEmail}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">Owner</div>
          </div>

          {/* Render members from backend */}
          {members === undefined ? (
            <div className="text-center py-4 text-sm text-gray-500">
              Loading members...
            </div>
          ) : members && members.length > 0 ? (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                
                {/* Show management controls ONLY if user can manage members */}
                {canManageMembers ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(v: any) => handleUpdateMemberRole(member.id, v)}
                    >
                      <SelectTrigger className="w-32 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="qa_tester">QA Tester</SelectItem>
                        <SelectItem value="qa_lead">QA Lead</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    {formatRoleDisplay(member.role)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No members added yet
            </div>
          )}
        </div>

        {/* General access */}
        <div className="px-5 py-3 border-t">
          <h3 className="text-sm font-semibold mb-3">General access</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Restricted</span>
            </div>
            {canManageMembers && (
              <button className="text-gray-600 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-between">
          <Button variant="outline" onClick={handleCopyLink} disabled={isCopied}>
            {isCopied ? (
              <Check className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {isCopied ? "Copied!" : "Copy link"}
          </Button>
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}