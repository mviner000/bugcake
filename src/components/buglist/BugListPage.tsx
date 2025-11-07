// src/components/buglist/BugListPage.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bug } from "lucide-react";

export function BugListPage() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();

  // Fetch the bug list for this checklist
  const bugList = useQuery(
    api.myFunctions.getBugListByChecklistId,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  // Fetch all bugs in this bug list
  const bugs = useQuery(
    api.myFunctions.getBugsByBugListId,
    bugList?._id ? { bugListId: bugList._id } : "skip"
  );

  // Fetch checklist details for header info
  const checklist = useQuery(
    api.myFunctions.getChecklistById,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  const handleBack = () => {
    navigate(`/checklist/${checklistId}`);
  };

  // ✅ NEW: Handler to navigate to bug detail page
  const handleBugClick = (bugId: string) => {
    navigate(`/checklist/${checklistId}/bugs/${bugId}`);
  };

  // Loading state
  if (bugList === undefined || bugs === undefined || checklist === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bug list...</p>
        </div>
      </div>
    );
  }

  // Bug list not found
  if (!bugList) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Bug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bug List Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            No bug list exists for this checklist.
          </p>
          <Button onClick={handleBack}>Back to Checklist</Button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-[65px] z-40">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-amber-600" />
                  <h1 className="text-xl font-semibold text-gray-900 truncate">
                    Bug List - {bugList.sprintName}
                  </h1>
                </div>
                <p className="text-sm text-gray-500">
                  {bugList.titleRevisionNumber} • {bugList.environment}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bug Statistics */}
      <div className="px-4 md:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Total Bugs</div>
            <div className="text-2xl font-bold text-gray-900">
              {bugList.totalBugs}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Open Bugs</div>
            <div className="text-2xl font-bold text-red-600">
              {bugList.openBugs}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Resolved Bugs</div>
            <div className="text-2xl font-bold text-green-600">
              {bugList.resolvedBugs}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="text-lg font-semibold text-gray-900">
              {bugList.status}
            </div>
          </div>
        </div>

        {/* Bug List */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              All Bugs ({bugs.length})
            </h2>
          </div>

          {bugs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bug className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium mb-1">No bugs found</p>
              <p className="text-sm">
                Bugs will appear here when test cases fail during execution.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {bugs.map((bug) => (
                <div 
                  key={bug._id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleBugClick(bug._id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {bug.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            bug.status === "New"
                              ? "bg-red-100 text-red-700"
                              : bug.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : bug.status === "Fixed"
                              ? "bg-yellow-100 text-yellow-700"
                              : bug.status === "Closed"
                              ? "bg-green-100 text-green-700"
                              : bug.status === "Reopened"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {bug.status}
                        </span>
                        {bug.priority && (
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              bug.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : bug.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {bug.priority}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Steps to Reproduce:
                          </span>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap line-clamp-2">
                            {bug.stepsToReproduce}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">
                            Expected Results:
                          </span>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap line-clamp-2">
                            {bug.expectedResults}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">
                            Actual Results:
                          </span>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap line-clamp-2">
                            {bug.actualResults}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 pt-2 text-xs text-gray-500">
                          <span>Reported by: {bug.reporterName}</span>
                          <span>•</span>
                          <span>Assigned to: {bug.assigneeName}</span>
                          <span>•</span>
                          <span>{formatDate(bug.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}