// src/components/checklist/share-dialog/ChecklistMembersList.tsx

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "qa_tester" | "qa_lead" | "viewer" | "owner";
}

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  requestedRole: "qa_tester" | "qa_lead" | "viewer";
  requestMessage?: string;
  requestedAt: number;
}

interface ChecklistMembersListProps {
  members: Member[] | undefined;
  pendingRequests: PendingRequest[] | undefined;
  activeTab: "all" | "requests";
  onTabChange: (tab: "all" | "requests") => void;
  checklistOwnerEmail: string;
  checklistOwnerId: string;
  currentUserId: string | undefined;
  canManageMembers: boolean;
  onUpdateMemberRole: (memberId: string, newRole: "qa_tester" | "qa_lead" | "viewer") => void;
  onRemoveMember: (memberId: string) => void;
  onCopyLink: () => void;
  onSendEmail: () => void;
  onApproveRequest: (requestId: string, finalRole: "qa_tester" | "qa_lead" | "viewer") => void;
  onDeclineRequest: (requestId: string) => void;
}

export function ChecklistMembersList({
  members,
  pendingRequests,
  activeTab,
  currentUserId,
  canManageMembers,
  onUpdateMemberRole,
  onRemoveMember,
  onApproveRequest,
  onDeclineRequest,
}: ChecklistMembersListProps) {
  
  const getRoleLabel = (role: string) => {
    if (role === "owner") return "Owner";
    if (role === "qa_lead") return "QA Lead";
    if (role === "qa_tester") return "QA Tester";
    if (role === "viewer") return "Viewer";
    return role;
  };

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Show members list
  if (activeTab === "all") {
    if (!members) {
      return (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading members...
        </div>
      );
    }

    return (
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {members.map((member) => {
            const isOwner = member.role === "owner";
            const isCurrentUser = currentUserId === member.id;
            const canModify = canManageMembers && !isOwner && !isCurrentUser;

            return (
              <div key={member.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-300 text-gray-700">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {member.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-gray-500">(you)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canModify ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          onUpdateMemberRole(member.id, value as "qa_tester" | "qa_lead" | "viewer")
                        }
                      >
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="qa_tester">QA Tester</SelectItem>
                          <SelectItem value="qa_lead">QA Lead</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMember(member.id)}
                        className="h-9 w-9 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 min-w-[140px] text-right">
                      {getRoleLabel(member.role)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Show requests list
  if (activeTab === "requests") {
    if (!pendingRequests) {
      return (
        <div className="px-5 py-8 text-center text-sm text-gray-500">
          Loading requests...
        </div>
      );
    }

    if (pendingRequests.length === 0) {
      return (
        <div className="px-5 py-8 text-center text-sm text-gray-500">
          No pending access requests
        </div>
      );
    }

    return (
      <div className="px-5 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div key={request.id} className="py-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-300 text-gray-700">
                      {request.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{request.name}</div>
                    <div className="text-xs text-gray-500">{request.email}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatTimeAgo(request.requestedAt)}
                </div>
              </div>

              {request.requestMessage && (
                <div className="ml-[52px] text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {request.requestMessage}
                </div>
              )}

              <div className="ml-[52px] flex items-center gap-2">
                <Select
                  defaultValue={request.requestedRole}
                  onValueChange={(value) =>
                    onApproveRequest(request.id, value as "qa_tester" | "qa_lead" | "viewer")
                  }
                >
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="qa_tester">QA Tester</SelectItem>
                    <SelectItem value="qa_lead">QA Lead</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeclineRequest(request.id)}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}