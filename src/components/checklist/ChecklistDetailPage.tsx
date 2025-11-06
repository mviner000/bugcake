// src/components/checklist/ChecklistDetailPage.tsx

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { ChecklistDetailsTab } from "./ChecklistDetailsTab";
import { ChecklistHistoryTab } from "./ChecklistHistoryTab";
import { ChecklistHeader } from "./ChecklistHeader";
import { ChecklistSidebar } from "./ChecklistSidebar";
import { ChecklistModuleFilter } from "./ChecklistModuleFilter";
import { ChecklistStatusButtonGroup } from "./ChecklistStatusButtonGroup";
import { ChecklistStatusConfirmationDialog } from "./ChecklistStatusConfirmationDialog";
import { DocumentIcon } from "../icons/DocumentIcon";
import { useItemStatus } from "@/hooks/useItemStatus";
import { useResponsiveDetail } from "@/hooks/useResponsiveDetail";
import { useModuleFilter } from "@/hooks/useModuleFilter";
import {
  calculateProgress,
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatusButtonColor,
} from "@/utils/checklistUtils";

// --- Type Definitions ---
type ChecklistItem = Doc<"checklistItems"> & {
  sequenceNumber: number;
};
type Checklist = Doc<"checklists"> & {
  sheetName?: string;
  creatorName?: string;
  executorName?: string;
};

type UserRole = "owner" | "qa_lead" | "qa_tester" | "viewer" | "guest";

type TabType = "details" | "history";

// --- Main Component ---
export function ChecklistDetailPage() {
  const navigate = useNavigate();
  const { checklistId } = useParams<{ checklistId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("details");

  // Use extracted hooks
  const {
    selectedItemId,
    showDetailOnMobile,
    handleItemSelect,
    handleBackToList,
  } = useResponsiveDetail();

  const {
    pendingStatusChange,
    actualResults,
    setActualResults,
    initiateStatusChange,
    cancelStatusChange,
  } = useItemStatus();

  const updateItemStatus = useMutation(api.myFunctions.updateChecklistItemStatus);
  
  // 1. Fetch current user profile
  const currentUser = useQuery(api.myFunctions.getMyProfile);
  
  // 2. Fetch checklist data
  const checklistData = useQuery(
    api.myFunctions.getChecklistById,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );
  
  // 3. Fetch checklist items
  const checklistItems = useQuery(
    api.myFunctions.getChecklistItems,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  ) as ChecklistItem[] | undefined;

  // 4. Fetch checklist members
  const members = useQuery(
    api.myFunctions.getChecklistMembers,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  ) as { userId: string, role: UserRole }[] | undefined;

  // Fetch status history for selected item
  const statusHistory = useQuery(
    api.myFunctions.getChecklistItemStatusHistory,
    selectedItemId ? { itemId: selectedItemId as Id<"checklistItems"> } : "skip"
  );
  
  // Use module filter hook
  const {
    selectedModule,
    setSelectedModule,
    uniqueModules,
    filteredItems,
  } = useModuleFilter(checklistItems);
  
  /**
   * Determines the current user's role for this specific checklist.
   */
  const getActualUserRole = (): UserRole | undefined => {
    if (!currentUser || !checklistData) return undefined;
    
    // Check if user is the owner
    if (currentUser._id === checklistData.createdBy) {
      return "owner";
    }

    // Check if user is in the members list
    if (members && Array.isArray(members)) {
      const memberRecord = members.find(m => m.userId === currentUser._id);
      if (memberRecord) {
        return memberRecord.role;
      }
    }

    // User is not owner and not in members list = guest
    return "guest";
  };

  const actualUserRole = getActualUserRole();

  // ✅ NEW: Redirect guest users to access request page
  if (
    currentUser !== undefined && 
    checklistData !== undefined && 
    members !== undefined && 
    actualUserRole === "guest"
  ) {
    return <Navigate to={`/checklist/${checklistId}/request-access`} replace />;
  }
  
  const onBack = () => {
    navigate("/");
  };
  
  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    try {
      await updateItemStatus({
        itemId: pendingStatusChange.itemId as Id<"checklistItems">,
        executionStatus: pendingStatusChange.newStatus as any,
        actualResults: actualResults,
      });
      cancelStatusChange();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (checklistData === undefined || checklistItems === undefined || currentUser === undefined || members === undefined) {
    return <div className="p-4 text-center">Loading checklist...</div>;
  }

  if (!checklistData || !checklistItems) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Checklist not found</h2>
          <p className="text-gray-600 mb-6">
            The checklist you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const checklist = checklistData as Checklist;
  const selectedItem = selectedItemId
    ? checklistItems.find((item) => item._id === selectedItemId)
    : null;
  const progress = calculateProgress(filteredItems || []);
  
  return (
    <div className="min-h-[calc(100vh-45px)] bg-gray-50">
      {/* Confirmation Alert Dialog - Now using the separated component */}
      <ChecklistStatusConfirmationDialog
        isOpen={pendingStatusChange !== null}
        newStatus={pendingStatusChange?.newStatus || null}
        actualResults={actualResults}
        onActualResultsChange={setActualResults}
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
      />

      {/* Header Component - Fixed with proper z-index stacking */}
      <div className={`${showDetailOnMobile ? 'hidden' : 'block'} md:block sticky top-[64px] z-30 bg-white`}>
        <ChecklistHeader
          sprintName={checklist.sprintName}
          titleRevisionNumber={checklist.titleRevisionNumber}
          createdAt={checklist.createdAt}
          onBack={onBack}
          formatDate={formatDate}
          currentUserRole={actualUserRole}
          checklistOwnerEmail={checklist.creatorName || "unknown@owner.com"}
          checklistOwnerId={checklist.createdBy}
          checklistId={checklistId!}
        />
      </div>

      {/* Module Filter Component - Fixed with proper z-index and positioning */}
      <div className={`${showDetailOnMobile ? 'hidden' : 'block'} md:block sticky top-[145px] z-20 bg-white`}>
        <ChecklistModuleFilter
          modules={uniqueModules}
          selectedModule={selectedModule}
          onModuleSelect={setSelectedModule}
          totalCount={checklistItems?.length || 0}
          filteredCount={filteredItems?.length || 0}
        />
      </div>

      <div className="flex h-[calc(100vh-190px)]">
        {/* Sidebar - Full width on mobile, fixed width on desktop */}
        <div className={`${showDetailOnMobile ? 'hidden' : 'w-full'} md:block md:w-80 md:flex-shrink-0`}>
          <ChecklistSidebar
            testCaseType={checklist.testCaseType}
            checklistItems={filteredItems || []}
            selectedItemId={selectedItemId}
            onItemSelect={handleItemSelect}
            progress={progress}
            getStatusColor={getStatusColor}
          />
        </div>

        {/* Main Content - Full width on mobile when shown, flex on desktop */}
        <div className={`${showDetailOnMobile ? 'w-full' : 'hidden'} md:block md:flex-1 overflow-y-auto`}>
          {selectedItem ? (
            <div className="p-4 md:p-6">
              {/* Mobile back button */}
              <button
                onClick={handleBackToList}
                className="cursor-pointer md:hidden mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>

              <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                      {selectedItem.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Created {formatDate(selectedItem.createdAt)}
                    </p>
                  </div>

                  {/* Button Group for Status Change - Now using the separated component */}
                  <ChecklistStatusButtonGroup
                    currentStatus={selectedItem.executionStatus}
                    onStatusChange={initiateStatusChange}
                    itemId={selectedItem._id}
                    getStatusButtonColor={getStatusButtonColor}
                  />
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === "details"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === "history"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Status History
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "details" ? (
                  <ChecklistDetailsTab 
                    selectedItem={selectedItem}
                  />
                ) : (
                  <ChecklistHistoryTab
                    statusHistory={statusHistory}
                    formatDateTime={formatDateTime}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center justify-center h-full">
              <div className="text-center">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg text-gray-500">
                  Select a test case from the sidebar to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}