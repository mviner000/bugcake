// src/components/checklist/ChecklistHeader.tsx

import { useState } from "react";
import { Share2, MoreHorizontal, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ChecklistUserRoleBadge } from "./ChecklistUserRoleBadge";
import { ChecklistMembersDialog } from "./ChecklistMembersDialog";

type UserRole = "qa_lead" | "qa_tester" | "owner" | "viewer" | undefined;

interface ChecklistHeaderProps {
  sprintName: string;
  titleRevisionNumber: string;
  createdAt: number;
  onBack: () => void;
  formatDate: (timestamp: number) => string;
  currentUserRole: UserRole;
  checklistOwnerEmail: string;
  checklistOwnerId: string;
  checklistId: string;
}

export function ChecklistHeader({
  sprintName,
  titleRevisionNumber,
  createdAt,
  onBack,
  formatDate,
  currentUserRole,
  checklistOwnerEmail,
  checklistOwnerId,
  checklistId,
}: ChecklistHeaderProps) {
  const [showMembersDialog, setShowMembersDialog] = useState(false);

  const canManageMembers = currentUserRole === "owner" || currentUserRole === "qa_lead";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Checklist link has been copied to clipboard.");
    });
  };

  return (
    <>
      <header className="sticky top-[65px] bg-white border-b border-gray-200 z-40">
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
      <ChecklistMembersDialog
        isOpen={showMembersDialog}
        onClose={() => setShowMembersDialog(false)}
        checklistId={checklistId}
        checklistOwnerId={checklistOwnerId}
        checklistOwnerEmail={checklistOwnerEmail}
        sprintName={sprintName}
        currentUserRole={currentUserRole}
      />
    </>
  );
}