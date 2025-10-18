import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom";
import { X, Share2, MoreHorizontal, User, AlertTriangle } from "lucide-react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type ChecklistItem = Doc<"checklistItems"> & {
  sequenceNumber: number;
};

type Checklist = Doc<"checklists"> & {
  sheetName?: string;
  creatorName?: string;
  executorName?: string;
};

export function ChecklistDetailPage() {
  const navigate = useNavigate();
  const { checklistId } = useParams<{ checklistId: string }>();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
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

      {/* Header */}
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
                  {checklist.sprintName} - {checklist.titleRevisionNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  Created {formatDate(checklist.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - List of Test Cases */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {checklist.testCaseType === "functionality"
                    ? "Functionality Test Cases"
                    : "Alt Text Test Cases"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {checklistItems.length} test cases
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {progress.percentage}%
                </div>
                <div className="text-xs text-gray-500">
                  {progress.completed}/{progress.total}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            
            {/* Status Breakdown */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {progress.passed > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">{progress.passed} Passed</span>
                </div>
              )}
              {progress.failed > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">{progress.failed} Failed</span>
                </div>
              )}
              {progress.blocked > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">{progress.blocked} Blocked</span>
                </div>
              )}
              {progress.skipped > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">{progress.skipped} Skipped</span>
                </div>
              )}
              {progress.notRun > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600">{progress.notRun} Not Run</span>
                </div>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {checklistItems.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedItemId(item._id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedItemId === item._id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      TC_{item.sequenceNumber.toString().padStart(3, "0")}
                    </p>
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.module}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                      item.executionStatus
                    )}`}
                  >
                    {item.executionStatus}
                  </span>
                  <p className="text-xs text-gray-400">
                    {item.originalCreatedBy.split('@')[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                    <button className="border-b-2 border-blue-600 py-2 px-1 text-sm font-medium text-blue-600">
                      Details
                    </button>
                    <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                      Status History
                    </button>
                  </nav>
                </div>

                {/* Module Hierarchy */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Module Hierarchy
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="inline-flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                      {selectedItem.module}
                    </span>
                  </div>
                </div>

                {/* Test Characteristics */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Test Characteristics
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        LEVEL:
                      </span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          selectedItem.level === "High"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedItem.level}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        SCENARIO:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedItem.scenario}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Overview */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      TESTING STATUS:
                    </span>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedItem.executionStatus}
                    </p>
                  </div>
                </div>

                {/* Pre-conditions (if exists) */}
                {selectedItem.preConditions && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Pre-conditions
                    </h3>
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedItem.preConditions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Test Steps */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Test Steps
                  </h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedItem.steps}
                    </p>
                  </div>
                </div>

                {/* Expected Results */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Expected Results
                  </h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedItem.expectedResults}
                    </p>
                  </div>
                </div>

                {/* Actual Results (if executed) */}
                {selectedItem.actualResults && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Actual Results
                    </h3>
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedItem.actualResults}
                      </p>
                    </div>
                  </div>
                )}

                {/* Details Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">CREATED BY</span>
                      <span className="ml-auto text-sm text-gray-900">
                        {selectedItem.originalCreatedBy}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">EXECUTED BY</span>
                      <span className="ml-auto text-sm text-gray-900">
                        {selectedItem.executedBy ? "Assigned" : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">CREATED AT</span>
                      <span className="ml-auto text-sm text-gray-900">
                        {new Date(selectedItem.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedItem.executedAt && (
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-gray-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">EXECUTED AT</span>
                        <span className="ml-auto text-sm text-gray-900">
                          {new Date(selectedItem.executedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedItem.jiraUserStory && (
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-gray-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">JIRA USER STORY</span>
                        <span className="ml-auto text-sm text-blue-600 hover:underline cursor-pointer">
                          {selectedItem.jiraUserStory}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
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