// src/components/checklist/ChecklistHeader.tsx

import { useState } from "react";
import { Share2, MoreHorizontal, X, UserPlus, Users } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
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

interface ChecklistHeaderProps {
  sprintName: string;
  titleRevisionNumber: string;
  createdAt: number;
  onBack: () => void;
  formatDate: (timestamp: number) => string;
  currentUserRole?: "super_admin" | "qa_lead" | "qa_tester" | "owner";
  checklistOwner?: string;
  members?: Array<{
    id: string;
    email: string;
    name: string;
    role: "editor" | "viewer";
    addedAt: number;
  }>;
}

export function ChecklistHeader({
  sprintName,
  titleRevisionNumber,
  createdAt,
  onBack,
  formatDate,
  currentUserRole = "qa_tester",
  checklistOwner = "owner@example.com",
  members = [],
}: ChecklistHeaderProps) {
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"editor" | "viewer">("viewer");
  const [localMembers, setLocalMembers] = useState(members);

  // Check if current user can manage members
  const canManageMembers = ["super_admin", "qa_lead", "owner"].includes(currentUserRole);

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;

    // TODO: Backend API call to add member
    const newMember = {
      id: Date.now().toString(),
      email: newMemberEmail,
      name: newMemberEmail.split("@")[0],
      role: newMemberRole,
      addedAt: Date.now(),
    };

    setLocalMembers([...localMembers, newMember]);
    setNewMemberEmail("");
    setNewMemberRole("viewer");
  };

  const handleRemoveMember = (memberId: string) => {
    // TODO: Backend API call to remove member
    setLocalMembers(localMembers.filter((m) => m.id !== memberId));
  };

  const handleUpdateMemberRole = (memberId: string, newRole: "editor" | "viewer") => {
    // TODO: Backend API call to update member role
    setLocalMembers(
      localMembers.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
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
                <h1 className="text-xl font-semibold text-gray-900">
                  {sprintName} - {titleRevisionNumber}
                </h1>
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
              <Button variant="outline" size="sm">
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manage Checklist Members
            </DialogTitle>
            <DialogDescription>
              Add team members and assign permissions. Editors can update test case statuses,
              while viewers can only view the checklist.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Add New Member Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Member</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
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
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddMember} disabled={!newMemberEmail.trim()}>
                  Add
                </Button>
              </div>
            </div>

            {/* Owner Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Owner</h3>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                    {checklistOwner.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{checklistOwner}</p>
                    <p className="text-xs text-gray-500">Full access to checklist</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  Owner
                </span>
              </div>
            </div>

            {/* Members List Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Members ({localMembers.length})
              </h3>
              {localMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border rounded-lg">
                  No members added yet. Add members to collaborate on this checklist.
                </div>
              ) : (
                <div className="space-y-2">
                  {localMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Added {formatDate(member.addedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(v: any) => handleUpdateMemberRole(member.id, v)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Permission Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Permission Levels</h4>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• <strong>Editor:</strong> Can update test case statuses and view all details</li>
                <li>• <strong>Viewer:</strong> Can only view checklist and test case details</li>
                <li>• <strong>Owner:</strong> Full access including member management and deletion</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowMembersDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}