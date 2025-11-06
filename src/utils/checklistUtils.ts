// src/utils/checklistUtils.ts

import { Doc } from "../../convex/_generated/dataModel";

type ChecklistItem = Doc<"checklistItems"> & {
  sequenceNumber: number;
};

/**
 * Calculates progress statistics for checklist items
 */
export const calculateProgress = (items: ChecklistItem[]) => {
  if (items.length === 0) {
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

  const statusCounts = items.reduce((acc, item) => {
    const status = item.executionStatus;
    if (status === "Passed") acc.passed++;
    else if (status === "Failed") acc.failed++;
    else if (status === "Blocked") acc.blocked++;
    else if (status === "Skipped") acc.skipped++;
    else if (status === "Not Run") acc.notRun++;
    return acc;
  }, { passed: 0, failed: 0, blocked: 0, skipped: 0, notRun: 0 });
  
  const completed = items.filter(
    (item) => item.executionStatus !== "Not Run"
  ).length;
  const total = items.length;
  const percentage = Math.round((completed / total) * 100);
  
  return { 
    completed, 
    total, 
    percentage,
    ...statusCounts
  };
};

/**
 * Formats a timestamp to a date string (MM/DD/YYYY)
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

/**
 * Formats a timestamp to a date and time string
 */
export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Returns the Tailwind CSS classes for a given status
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "Not Run": "bg-gray-100 text-gray-800",
    Passed: "bg-green-100 text-green-800",
    Failed: "bg-red-100 text-red-800",
    Blocked: "bg-yellow-100 text-yellow-800",
    Skipped: "bg-blue-100 text-blue-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

/**
 * Returns the Tailwind CSS classes for status buttons
 */
export const getStatusButtonColor = (status: string): string => {
  const colors: Record<string, string> = {
    Passed: "bg-green-600 hover:bg-green-700",
    Failed: "bg-red-600 hover:bg-red-700",
    Blocked: "bg-yellow-600 hover:bg-yellow-700",
    "Not Run": "bg-gray-600 hover:bg-gray-700",
    Skipped: "bg-blue-600 hover:bg-blue-700",
  };
  return colors[status] || "";
};