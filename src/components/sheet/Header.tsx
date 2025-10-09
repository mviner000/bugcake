// components/sheet/Header.tsx

import { useState } from "react";
import {
  Share,
  Menu,
} from "lucide-react";
import { api } from "../../../convex/_generated/api"
import { ShareModal } from "./share-modal";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import ActivityApprovalsSheet from "./right-side/ActivityApprovalsSheet";
import AltTextAriaLabelDetailsModal from "./alttextarialabel/AltTextAriaLabelDetailsModal";
import FunctionalityTestCasesDetailsModal from "./functionality/FunctionalityTestCaseDetailsModal";
import { UserRoleDisplay } from "./UserRoleDisplay";
import { useQuery } from "convex/react";

type SheetType = "altTextAriaLabel" | "functionality";

interface HeaderProps {
  sheetName?: string;
  onBack: () => void;
  sheetType: SheetType;
}

export function Header({ sheetName, sheetId, sheetType }: HeaderProps & { sheetId: string }) {
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const normalizedSheetId = sheetId as Id<"sheets">;

  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, {
    sheetId: normalizedSheetId,
  })

  return (
    <>
      <ShareModal 
        open={isShareModalOpen} 
        onOpenChange={setIsShareModalOpen} 
        fileName={sheetName} 
        sheetId={normalizedSheetId}
      />
      <header className="border-b border-gray-200 relative z-10">
        {/* Main header row */}
        <div className="px-2 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          {/* Top row on mobile: Logo and avatar */}
          <div className="flex items-center justify-between sm:flex-1 sm:min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 cursor-pointer flex-shrink-0" />
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-xl text-gray-700 font-normal truncate">
                    {sheetName}
                  </span>
                  {/* User role - inline with sheet name on mobile, spaced out on md+ */}
                  <div className="block md:inline-flex">
                    <UserRoleDisplay usersWithAccess={usersWithAccess} />
                  </div>
                </div>

              </div>
            </div>

            {/* Avatar - Only on mobile in this row, hidden on sm+ where it moves to right section */}
            <div className="sm:hidden w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-xs cursor-pointer flex-shrink-0">
              A
            </div>
          </div>

          {/* Bottom row on mobile: All action buttons */}
          <div className="flex items-center gap-2 -mx-2 px-2 overflow-visible py-2 sm:mx-0 sm:px-0 sm:py-0 sm:space-x-2 md:space-x-4 sm:flex-shrink-0">
            {/* Detail modals and Activity - Always visible */}
            <div className="flex-shrink-0 relative z-20">
              {sheetType === "altTextAriaLabel" && (
                <AltTextAriaLabelDetailsModal sheetId={sheetId} />
              )}
              {sheetType === "functionality" && (
                <FunctionalityTestCasesDetailsModal sheetId={sheetId} />
              )}
            </div>
            <div className="flex-shrink-0 relative">
              <ActivityApprovalsSheet sheetId={sheetId as any} />
            </div>

            {/* Share button - Icon only on mobile, text + icon on sm+ */}
            <Button 
              onClick={() => setIsShareModalOpen(true)} 
              size="sm" 
              className="bg-blue-700 text-white hover:bg-blue-70 px-2 sm:px-3 whitespace-nowrap flex-shrink-0"
            >
              <Share className="w-4 h-4" />
              <span className="hidden sm:inline sm:ml-2">Share</span>
            </Button>

            {/* Avatar - Hidden on mobile (shown in top row), visible on sm+ */}
            <div className="hidden sm:flex w-8 h-8 bg-orange-500 rounded-full items-center justify-center text-white font-medium text-sm cursor-pointer flex-shrink-0">
              A
            </div>
          </div>
        </div>

      </header>
    </>
  );
}