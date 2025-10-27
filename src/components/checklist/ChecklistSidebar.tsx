// src/components/checklist/ChecklistSidebar.tsx

import { Doc } from "../../../convex/_generated/dataModel";

type ChecklistItem = Doc<"checklistItems"> & {
  sequenceNumber: number;
};

interface ChecklistSidebarProps {
  testCaseType: "functionality" | "altTextAriaLabel";
  checklistItems: ChecklistItem[];
  selectedItemId: string | null;
  onItemSelect: (itemId: string) => void;
  progress: {
    completed: number;
    total: number;
    percentage: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    notRun: number;
  };
  getStatusColor: (status: string) => string;
}

export function ChecklistSidebar({
  testCaseType,
  checklistItems,
  selectedItemId,
  onItemSelect,
  progress,
  getStatusColor,
}: ChecklistSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">
              {testCaseType === "functionality"
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
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
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
            onClick={() => onItemSelect(item._id)}
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
  );
}