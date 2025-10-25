// src/components/checklist/ChecklistDetailsTab.tsx

import { User } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";

type ChecklistItem = Doc<"checklistItems"> & {
  sequenceNumber: number;
};

interface ChecklistDetailsTabProps {
  selectedItem: ChecklistItem;
  formatDate: (timestamp: number) => string;
}

export function ChecklistDetailsTab({ selectedItem, formatDate }: ChecklistDetailsTabProps) {
  return (
    <>
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
    </>
  );
}