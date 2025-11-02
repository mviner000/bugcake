// src/components/checklist/share-dialog/ChecklistMembersList.tsx

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "qa_tester" | "qa_lead" | "viewer" | "owner";
}

interface ChecklistMembersListProps {
  members: Member[] | undefined;
  checklistOwnerEmail: string;
  checklistOwnerId: string;
  currentUserId: string | undefined;
  canManageMembers: boolean;
  onUpdateMemberRole: (memberId: string, newRole: "qa_tester" | "qa_lead" | "viewer") => void;
  onRemoveMember: (memberId: string) => void;
}

export function ChecklistMembersList({
  members,
  checklistOwnerEmail,
  checklistOwnerId,
  currentUserId,
  canManageMembers,
  onUpdateMemberRole,
  onRemoveMember,
}: ChecklistMembersListProps) {
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
      {/* Owner */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
            {checklistOwnerEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">
              {checklistOwnerEmail.split("@")[0]}
              {currentUserId === checklistOwnerId && " (you)"}
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
            
            {canManageMembers ? (
              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(v: any) => onUpdateMemberRole(member.id, v)}
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
                  onClick={() => onRemoveMember(member.id)}
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
  );
}