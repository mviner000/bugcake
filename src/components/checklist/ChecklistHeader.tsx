// src/components/checklist/ChecklistHeader.tsx

import { useState } from "react";
import { MoreHorizontal, X, UserPlus, Share, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChecklistUserRoleBadge } from "./ChecklistUserRoleBadge";
import { ChecklistShareDialog } from "./ChecklistShareDialog";

// ✅ FIXED: Added "guest" to the UserRole type
type UserRole = "qa_lead" | "qa_tester" | "owner" | "viewer" | "guest" | undefined;

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

  return (
    <>
      <header className="sticky top-[65px] bg-white border-b z-40">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left section - Back button and title */}
            <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-1">
                  <h1 className="text-base md:text-xl font-semibold text-gray-900 truncate">
                    {sprintName} - {titleRevisionNumber}
                  </h1>
                  <ChecklistUserRoleBadge 
                    checklistId={checklistId}
                    checklistOwnerId={checklistOwnerId}
                  />
                </div>
                <p className="text-xs md:text-sm text-gray-500">
                  Created {formatDate(createdAt)}
                </p>
              </div>
            </div>

            {/* Right section - Action buttons */}
            <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
              {/* View Bugs Button */}
              <Button
                onClick={() => console.log("View Bugs clicked")} // replace with your handler
                size="sm"
                className="bg-amber-600 text-white hover:bg-amber-700 px-2 sm:px-3 whitespace-nowrap flex-shrink-0"
              >
                <Bug className="w-4 h-4" />

                <span className="hidden sm:inline">View Bugs</span>
              </Button>

              {/* Share - Hidden on mobile, shown on desktop */}
              {canManageMembers && (
                <Button 
                  onClick={() => setShowMembersDialog(true)} 
                  size="sm" 
                  className="bg-blue-700 text-white hover:bg-blue-800 px-2 sm:px-3 whitespace-nowrap flex-shrink-0"
                >
                  <Share className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              )}

              {/* More options dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Mobile-only: Share */}
                  {canManageMembers && (
                    <DropdownMenuItem 
                      className="md:hidden"
                      onClick={() => setShowMembersDialog(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  )}
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
      <ChecklistShareDialog
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