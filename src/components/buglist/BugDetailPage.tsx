// src/components/buglist/BugDetailPage.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bug, User, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BugDetailPage() {
  const { checklistId, bugId } = useParams<{ checklistId: string; bugId: string }>();
  const navigate = useNavigate();

  // Fetch the bug details
  const bug = useQuery(
    api.myFunctions.getBugById,
    bugId ? { bugId: bugId as Id<"bugs"> } : "skip"
  );

  // Fetch checklist for context
  const checklist = useQuery(
    api.myFunctions.getChecklistById,
    checklistId ? { checklistId: checklistId as Id<"checklists"> } : "skip"
  );

  const handleBack = () => {
    navigate(`/checklist/${checklistId}/bugs`);
  };

  // Loading state
  if (bug === undefined || checklist === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bug details...</p>
        </div>
      </div>
    );
  }

  // Bug not found
  if (!bug) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Bug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bug Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The bug you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={handleBack}>Back to Bug List</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "New": "bg-red-100 text-red-700",
      "Assigned": "bg-blue-100 text-blue-700",
      "In Progress": "bg-blue-100 text-blue-700",
      "Fixed": "bg-yellow-100 text-yellow-700",
      "Ready for Retest": "bg-purple-100 text-purple-700",
      "Closed": "bg-green-100 text-green-700",
      "Reopened": "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "bg-gray-100 text-gray-700";
    const colors: Record<string, string> = {
      "High": "bg-red-100 text-red-700",
      "Medium": "bg-yellow-100 text-yellow-700",
      "Low": "bg-blue-100 text-blue-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
                  <Bug className="w-5 h-5 text-red-600" />
                  <h1 className="text-xl font-semibold text-gray-900 truncate">
                    {bug.title}
                  </h1>
                </div>
                <p className="text-sm text-gray-500">
                  Bug in {checklist?.sprintName} • {checklist?.titleRevisionNumber}
                </p>
              </div>
            </div>

            {/* Status and Priority Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={getStatusColor(bug.status)}>
                {bug.status}
              </Badge>
              {bug.priority && (
                <Badge className={getPriorityColor(bug.priority)}>
                  {bug.priority} Priority
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Bug Details Card */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Reported By</p>
                  <p className="text-sm text-gray-900 mt-1">{bug.reporterName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned To</p>
                  <p className="text-sm text-gray-900 mt-1">{bug.assigneeName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Reported On</p>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(bug.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Steps to Reproduce */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Steps to Reproduce
              </h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {bug.stepsToReproduce}
                </p>
              </div>
            </div>

            {/* Expected Results */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Expected Results
              </h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {bug.expectedResults}
                </p>
              </div>
            </div>

            {/* Actual Results */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Actual Results
              </h3>
              <div className="bg-red-50 rounded-md p-4 border border-red-200">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {bug.actualResults}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bug Reported</p>
                    <p className="text-xs text-gray-500">{formatDate(bug.createdAt)}</p>
                  </div>
                </div>
                
                {bug.updatedAt !== bug.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-500">{formatDate(bug.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleBack}
            >
              Back to Bug List
            </Button>
            <Button
              variant="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled
            >
              Edit Bug (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}