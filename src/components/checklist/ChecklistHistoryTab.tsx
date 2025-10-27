// src/components/checklist/ChecklistHistoryTab.tsx

import { useState } from "react";
import { Clock, User, CheckCircle2, X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusHistoryEvent {
  status: string;
  timestamp: number;
  userName: string;
  userEmail: string;
  actualResults?: string;
  isCreation?: boolean;
}

interface StatusHistoryData {
  item: {
    id: string;
    title: string;
    currentStatus: string;
    module: string;
  };
  timeline: StatusHistoryEvent[];
}

interface ChecklistHistoryTabProps {
  statusHistory: StatusHistoryData | undefined;
  formatDateTime: (timestamp: number) => string;
}

export function ChecklistHistoryTab({
  statusHistory,
  formatDateTime,
}: ChecklistHistoryTabProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Passed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "Failed":
        return <X className="w-5 h-5 text-red-600" />;
      case "Blocked":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "Not Run":
        return <Clock className="w-5 h-5 text-gray-400" />;
      case "Skipped":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Passed":
      case "Approved":
        return "default";
      case "Failed":
      case "Declined":
        return "destructive";
      case "Blocked":
      case "Needs revision":
        return "outline";
      case "In Progress":
      case "Waiting for QA Lead Approval":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (isCreation: boolean) => {
    // You can customize this based on your user roles
    // For now, we'll use a simple heuristic
    if (isCreation) return "Creator";
    return "QA Tester";
  };

  // Loading state
  if (statusHistory === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!statusHistory || statusHistory.timeline.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">
            No history available
          </p>
          <p className="text-sm text-gray-500">
            Status changes will appear here once the test case is executed
          </p>
        </div>
      </div>
    );
  }

  // Main content with timeline (following wireframe design)
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Execution Timeline
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Track all status changes and updates for this test case
        </p>
      </div>

      {/* Timeline - Wireframe Style */}
      <div className="relative space-y-0">
        {/* Vertical timeline line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-gray-200" />

        {/* Timeline items */}
        <div className="space-y-0">
          {statusHistory.timeline.map((event, index) => {
            const isExpanded = expandedItems.has(index);
            const hasDetails = event.actualResults || event.isCreation;
            
            return (
              <div key={index} className="relative">
                {/* Main timeline entry */}
                <div
                  className={`relative pl-12 pb-6 ${
                    hasDetails ? "cursor-pointer hover:bg-gray-50" : ""
                  } transition-colors rounded-lg`}
                  onClick={() => hasDetails && toggleExpand(index)}
                >
                  {/* Icon circle */}
                  <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-sm">
                    {getStatusIcon(event.status)}
                  </div>

                  {/* Content */}
                  <div className="pt-0.5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {event.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          · {getRoleLabel(event.isCreation || false)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDateTime(event.timestamp)}
                        </span>
                        {hasDetails && (
                          <button className="text-gray-400 hover:text-gray-600">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getStatusBadgeVariant(event.status)} className="text-xs">
                        {event.status}
                      </Badge>
                      {event.isCreation && (
                        <span className="text-xs text-gray-500 italic">
                          Test case added to checklist
                        </span>
                      )}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && hasDetails && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{event.userEmail}</span>
                        </div>
                        
                        {event.actualResults && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-700 mb-1">
                              Actual Results:
                            </p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                              {event.actualResults}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Summary
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Changes
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {statusHistory.timeline.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Current Status
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {statusHistory.item.currentStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}