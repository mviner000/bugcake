// src/components/checklist/ChecklistDetailPage.tsx

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChecklistDetailsTab } from "./ChecklistDetailsTab";
import { ChecklistHistoryTab } from "./ChecklistHistoryTab";
import { ChecklistHeader } from "./ChecklistHeader";
import { ChecklistSidebar } from "./ChecklistSidebar";
import { DocumentIcon } from "../icons/DocumentIcon";

type ChecklistItem = Doc<"checklistItems"> & {
  sequenceNumber: number;
};

type Checklist = Doc<"checklists"> & {
  sheetName?: string;
  creatorName?: string;
  executorName?: string;
};

type TabType = "details" | "history";

export function ChecklistDetailPage() {
  const navigate = useNavigate();
  const { checklistId } = useParams<{ checklistId: string }>();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    itemId: string;
    newStatus: string;
  } | null>(null);

  const updateItemStatus = useMutation(api.myFunctions.updateChecklistItemStatus);

  // Fetch checklist data
  const checklistData = useQuery(
    api.myFunctions.getChecklistById,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // Fetch checklist items
  const checklistItems = useQuery(
    api.myFunctions.getChecklistItems,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  ) as ChecklistItem[] | undefined;

  // Fetch status history for selected item
  const statusHistory = useQuery(
    api.myFunctions.getChecklistItemStatusHistory,
    selectedItemId ? { itemId: selectedItemId as Id<"checklistItems"> } : "skip"
  );

  const onBack = () => {
    navigate("/");
  };

  const initiateStatusChange = (itemId: string, newStatus: string) => {
    setPendingStatusChange({ itemId, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    try {
      await updateItemStatus({
        itemId: pendingStatusChange.itemId as Id<"checklistItems">,
        executionStatus: pendingStatusChange.newStatus as any,
      });
      setPendingStatusChange(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const cancelStatusChange = () => {
    setPendingStatusChange(null);
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!checklistItems || checklistItems.length === 0) {
      return { 
        completed: 0, 
        total: 0, 
        percentage: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0,
        notRun: 0
      };
    }

    const statusCounts = checklistItems.reduce((acc, item) => {
      const status = item.executionStatus;
      if (status === "Passed") acc.passed++;
      else if (status === "Failed") acc.failed++;
      else if (status === "Blocked") acc.blocked++;
      else if (status === "Skipped") acc.skipped++;
      else if (status === "Not Run") acc.notRun++;
      return acc;
    }, { passed: 0, failed: 0, blocked: 0, skipped: 0, notRun: 0 });

    const completed = checklistItems.filter(
      (item) => item.executionStatus !== "Not Run"
    ).length;
    const total = checklistItems.length;
    const percentage = Math.round((completed / total) * 100);

    return { 
      completed, 
      total, 
      percentage,
      ...statusCounts
    };
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Not Run": "bg-gray-100 text-gray-800",
      Passed: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      Blocked: "bg-yellow-100 text-yellow-800",
      Skipped: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusButtonColor = (status: string) => {
    const colors: Record<string, string> = {
      Passed: "bg-green-600 hover:bg-green-700",
      Failed: "bg-red-600 hover:bg-red-700",
      Blocked: "bg-yellow-600 hover:bg-yellow-700",
      "Not Run": "bg-gray-600 hover:bg-gray-700",
      Skipped: "bg-blue-600 hover:bg-blue-700",
    };
    return colors[status] || "";
  };

  if (checklistData === undefined || checklistItems === undefined) {
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
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirmation Alert Dialog */}
      <AlertDialog open={pendingStatusChange !== null} onOpenChange={(open) => !open && cancelStatusChange()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the test case status to{" "}
              <span className="font-semibold text-gray-900">
                {pendingStatusChange?.newStatus}
              </span>
              ? This action will be recorded in the test execution history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelStatusChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header Component */}
      <ChecklistHeader
        sprintName={checklist.sprintName}
        titleRevisionNumber={checklist.titleRevisionNumber}
        createdAt={checklist.createdAt}
        onBack={onBack}
        formatDate={formatDate}
        currentUserRole="qa_lead" // or get from auth context
        checklistOwnerEmail={checklist.creatorName} // ✅ This is the email from the query
        checklistOwnerId={checklist.createdBy} // ✅ Pass the ID for comparison
        checklistId={checklistId!}
      />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - List of Test Cases */}
        <ChecklistSidebar
          testCaseType={checklist.testCaseType}
          checklistItems={checklistItems}
          selectedItemId={selectedItemId}
          onItemSelect={setSelectedItemId}
          progress={progress}
          getStatusColor={getStatusColor}
        />

        {/* Main Content - Test Case Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedItem ? (
            <div className="p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {selectedItem.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Created {formatDate(selectedItem.createdAt)}
                    </p>
                  </div>

                  {/* Button Group for Status Change */}
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <Button
                      variant={selectedItem.executionStatus === "Passed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => initiateStatusChange(selectedItem._id, "Passed")}
                      className={`rounded-r-none border-r-0 ${
                        selectedItem.executionStatus === "Passed" ? getStatusButtonColor("Passed") : ""
                      }`}
                    >
                      Passed
                    </Button>
                    <Button
                      variant={selectedItem.executionStatus === "Failed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => initiateStatusChange(selectedItem._id, "Failed")}
                      className={`rounded-none border-r-0 ${
                        selectedItem.executionStatus === "Failed" ? getStatusButtonColor("Failed") : ""
                      }`}
                    >
                      Failed
                    </Button>
                    <Button
                      variant={selectedItem.executionStatus === "Blocked" ? "default" : "outline"}
                      size="sm"
                      onClick={() => initiateStatusChange(selectedItem._id, "Blocked")}
                      className={`rounded-none border-r-0 ${
                        selectedItem.executionStatus === "Blocked" ? getStatusButtonColor("Blocked") : ""
                      }`}
                    >
                      Blocked
                    </Button>
                    <Button
                      variant={selectedItem.executionStatus === "Not Run" ? "default" : "outline"}
                      size="sm"
                      onClick={() => initiateStatusChange(selectedItem._id, "Not Run")}
                      className={`rounded-none border-r-0 ${
                        selectedItem.executionStatus === "Not Run" ? getStatusButtonColor("Not Run") : ""
                      }`}
                    >
                      Not Run
                    </Button>
                    <Button
                      variant={selectedItem.executionStatus === "Skipped" ? "default" : "outline"}
                      size="sm"
                      onClick={() => initiateStatusChange(selectedItem._id, "Skipped")}
                      className={`rounded-l-none ${
                        selectedItem.executionStatus === "Skipped" ? getStatusButtonColor("Skipped") : ""
                      }`}
                    >
                      Skipped
                    </Button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                        activeTab === "details"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
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
            <div className="flex items-center justify-center h-full">
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