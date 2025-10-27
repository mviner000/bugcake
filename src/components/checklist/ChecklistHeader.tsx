// src/components/checklist/ChecklistHeader.tsx
import { useState } from "react";
import { Share2, MoreHorizontal, X, UserPlus, Link, Mail, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface ChecklistHeaderProps {
  sprintName: string;
  titleRevisionNumber: string;
  createdAt: number;
  onBack: () => void;
  formatDate: (timestamp: number) => string;
  currentUserRole?: "super_admin" | "qa_lead" | "qa_tester" | "owner" | "viewer";
  checklistOwnerEmail?: string;
  checklistOwnerId: string;
  checklistId: string;
}

export function ChecklistHeader({
  sprintName,
  titleRevisionNumber,
  createdAt,
  onBack,
  formatDate,
  checklistOwnerEmail = "owner@example.com",
  checklistOwnerId,
  checklistId,
}: ChecklistHeaderProps) {
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"qa_tester" | "qa_lead" | "viewer">("viewer");
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");
  const [isCopied, setIsCopied] = useState(false);

  // Backend Integration: Fetch members from database
  const members = useQuery(
    api.myFunctions.getChecklistMembers,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // Get current user to identify owner and determine actual role
  const currentUser = useQuery(api.myFunctions.getMyProfile);

  // Backend Integration: Mutations
  const addMember = useMutation(api.myFunctions.addChecklistMember);
  const removeMember = useMutation(api.myFunctions.removeChecklistMember);
  const updateMemberRole = useMutation(api.myFunctions.updateChecklistMemberRole);

  // ✅ ROBUST: Determine the actual current user's role
  const getActualUserRole = (): "owner" | "qa_lead" | "qa_tester" | "viewer" => {
    if (!currentUser) return "viewer";

    // Check if current user is the checklist owner
    if (currentUser._id === checklistOwnerId) {
      return "owner";
    }

    // Check if user is in members list and get their role
    if (members && Array.isArray(members)) {
      const memberRecord = members.find(m => m.userId === currentUser._id);
      if (memberRecord) {
        return memberRecord.role as "owner" | "qa_lead" | "qa_tester" | "viewer";
      }
    }

    // Default to viewer
    return "viewer";
  };

  const actualUserRole = getActualUserRole();

  // ✅ ROBUST: Only owners and qa_leads can manage members
  const canManageMembers = actualUserRole === "owner" || actualUserRole === "qa_lead";

  // Handle add member with backend call
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

  // Handle remove member with backend call
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

  // Handle update member role with backend call
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
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {sprintName} - {titleRevisionNumber}
                  </h1>
                  <ChecklistUserRoleBadge 
                    checklistId={checklistId}
                    checklistOwnerId={checklistOwnerId}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Created {formatDate(createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canManageMembers && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMembersDialog(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Manage Members
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Checklist</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Members Management Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
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
                  
                  {/* ✅ FIXED: Show management controls ONLY for owners and qa_leads */}
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
            <Button onClick={() => setShowMembersDialog(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}