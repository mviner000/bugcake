// update the general access here src/components/checklist/ChecklistMembersDialog.tsx

import { useState } from "react";import { Link, Mail, X, Check, Copy, User, ChevronDown, ChevronUp, Lock, Globe } from "lucide-react"; // UPDATED: Added Lock and Globe
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
  
  // ✅ State to track selected role for each request
  const [selectedRequestRoles, setSelectedRequestRoles] = useState<Record<string, "qa_tester" | "qa_lead" | "viewer">>({});
  
  // ✅ State to track expanded request details
  const [expandedRequests, setExpandedRequests] = useState<Record<string, boolean>>({});
  
  // State for general access dropdown
  const [generalAccess, setGeneralAccess] = useState<"restricted" | "anyone_with_link" | "public">("restricted");

  // Fetch members from database
  const members = useQuery(
    api.myFunctions.getChecklistMembers,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // ✅ Fetch pending access requests
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
  
  // ✅ Request approval/decline mutations
  const approveRequest = useMutation(api.myFunctions.approveChecklistAccessRequest);
  const declineRequest = useMutation(api.myFunctions.declineChecklistAccessRequest);

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

  // ✅ Handle approve request
  const handleApproveRequest = async (requestId: string, finalRole: "qa_tester" | "qa_lead" | "viewer") => {
    try {
      await approveRequest({
        requestId: requestId as Id<"checklistAccessRequests">,
        finalRole: finalRole,
      });

      toast.success("Access request approved successfully.");
      
      // Clear the selected role for this request
      setSelectedRequestRoles(prev => {
        const newRoles = { ...prev };
        delete newRoles[requestId];
        return newRoles;
      });
      
      // Clear the expanded state for this request
      setExpandedRequests(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[requestId];
        return newExpanded;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve request.");
    }
  };

  // ✅ Handle decline request
  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineRequest({
        requestId: requestId as Id<"checklistAccessRequests">,
      });

      toast.success("Access request declined.");
      
      // Clear the selected role for this request
      setSelectedRequestRoles(prev => {
        const newRoles = { ...prev };
        delete newRoles[requestId];
        return newRoles;
      });
      
      // Clear the expanded state for this request
      setExpandedRequests(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[requestId];
        return newExpanded;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to decline request.");
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

  // ✅ Format time ago helper
  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  // NEW HELPER FUNCTION for General Access label
  const getAccessLevelLabel = (level: "restricted" | "anyone_with_link" | "public"): string => {
    switch (level) {
      case "restricted":
        return "Restricted";
      case "anyone_with_link":
        return "Anyone with the link";
      case "public":
        return "Public";
      default:
        return "Restricted";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex flex-col gap-1">
              <DialogTitle className="text-lg font-semibold">
                Share "{sprintName}"
              </DialogTitle>
            <div>
              <ChecklistUserRoleBadge 
                checklistId={checklistId}
                checklistOwnerId={checklistOwnerId}
              />
            </div>
          </div>
        </div>

        {/* Add Member Input - Only show if user can manage members */}
        {canManageMembers && (
          <div className="px-5">
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
        <div className="px-5 pt-2">
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
            <div className="grid grid-cols-2 border rounded-lg overflow-hidden">
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
                className={`py-2 text-sm font-medium relative ${
                  activeTab === "requests"
                    ? "bg-white border-b-2 border-black"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                Requests
                {/* ✅ Show badge if there are pending requests */}
                {pendingRequests && pendingRequests.length > 0 && (
                  <span className="absolute top-1 right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

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
            // ===== ALL MEMBERS TAB =====
            <>
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
            </>
          ) : (
            // ===== REQUESTS TAB =====
            <div className="space-y-4">
              {!pendingRequests || pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">No pending requests</p>
                  <p className="text-xs mt-1">Access requests will appear here</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg overflow-hidden bg-white">
                    {/* Request Header - Always Visible */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                            {request.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{request.name}</p>
                            <p className="text-xs text-gray-500">{request.email}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Requested {formatTimeAgo(request.requestedAt)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Hide/View Details Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedRequests({
                              ...expandedRequests,
                              [request.id]: !expandedRequests[request.id],
                            })
                          }
                          className="flex items-center gap-1 text-xs h-8 px-3"
                        >
                          {expandedRequests[request.id] ? "Hide Details" : "View Details"}
                          {expandedRequests[request.id] ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      {/* Expandable Details Section */}
                      {expandedRequests[request.id] && (
                        <div className="space-y-3 pt-3 border-t">
                          {/* Requested Role */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1 font-medium">Requested Role</p>
                            <p className="text-sm font-medium uppercase tracking-wide">
                              {request.requestedRole.replace('_', ' ')}
                            </p>
                          </div>

                          {/* Request Message - Only show if exists and is meaningful */}
                          {request.requestMessage && 
                           request.requestMessage.trim() !== "" && 
                           request.requestMessage.toLowerCase() !== "no message provided" && 
                           request.requestMessage.toLowerCase() !== "no message" && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1 font-medium">Message</p>
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                                {request.requestMessage}
                              </p>
                            </div>
                          )}

                          {/* Role Selector for Approval */}
                          <div className="space-y-1.5">
                            <Select
                              value={selectedRequestRoles[request.id] || request.requestedRole}
                              onValueChange={(v: any) =>
                                setSelectedRequestRoles({
                                  ...selectedRequestRoles,
                                  [request.id]: v,
                                })
                              }
                            >
                              <SelectTrigger className="w-full h-9 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="qa_tester">QA Tester</SelectItem>
                                <SelectItem value="qa_lead">QA Lead</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() =>
                                handleApproveRequest(
                                  request.id,
                                  selectedRequestRoles[request.id] || request.requestedRole as any
                                )
                              }
                              className="flex-1 bg-black hover:bg-gray-800 h-9"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleDeclineRequest(request.id)}
                              variant="outline"
                              className="flex-1 h-9"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* General access section - UPDATED STYLING */}
        <div className="px-5 py-3 border-t">
          <h3 className="text-sm font-medium mb-3">General access</h3> 
          
          <Select 
            value={generalAccess} 
            onValueChange={(value) => setGeneralAccess(value as "restricted" | "anyone_with_link" | "public")}
            disabled={!canManageMembers}
          >
            <SelectTrigger className="w-full h-11"> {/* UPDATED: h-auto py-3 to h-11 */}
              <div className="flex items-center gap-3">
                {/* UPDATED: Removed gray-200 background div and used Lucide icons directly */}
                {generalAccess === "restricted" && <Lock className="h-4 w-4 flex-shrink-0" />}
                {generalAccess === "anyone_with_link" && <Link className="h-4 w-4 flex-shrink-0" />}
                {generalAccess === "public" && <Globe className="h-4 w-4 flex-shrink-0" />}
                <span className="text-sm">{getAccessLevelLabel(generalAccess)}</span> {/* UPDATED: Use new helper function */}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restricted">
                <div className="flex items-start gap-3 py-1"> {/* UPDATED: items-center py-2 to items-start py-1 */}
                  <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" /> {/* UPDATED: Custom SVG to Lucide Lock, added mt-0.5 */}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Restricted</p>
                    <p className="text-xs text-muted-foreground"> {/* UPDATED: text-gray-500 to text-muted-foreground */}
                      Only people with access can open with the link
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="anyone_with_link">
                <div className="flex items-start gap-3 py-1">
                  <Link className="h-4 w-4 mt-0.5 flex-shrink-0" /> {/* UPDATED: Custom SVG to Lucide Link, added mt-0.5 */}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Anyone with the link</p>
                    <p className="text-xs text-muted-foreground">
                      Anyone with the link can access
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="public">
                <div className="flex items-start gap-3 py-1">
                  <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" /> {/* UPDATED: Custom SVG to Lucide Globe, added mt-0.5 */}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Public</p>
                    <p className="text-xs text-muted-foreground">
                      Anyone on the internet can find and access
                    </p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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