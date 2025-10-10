// src/components/sheet/common/baseTableUtils.ts

import {
  BaseTestCase,
  WorkflowStatus,
  StatusCounts,
  GroupedTestCases,
} from "@/components/sheet/common/types/testCaseTypes";

/**
 * Calculate status counts from test cases
 */
export function calculateStatusCounts<T extends { workflowStatus: WorkflowStatus }>(
  testCases: T[]
): StatusCounts {
  return testCases.reduce((acc, tc) => {
    const status = tc.workflowStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as StatusCounts);
}

/**
 * Group test cases by module
 */
export function groupTestCasesByModule<T extends BaseTestCase>(
  testCases: T[]
): GroupedTestCases<T> {
  const groups: Record<string, T[]> = {};

  testCases.forEach((testCase) => {
    const moduleKey = testCase.module || "ungrouped";
    if (!groups[moduleKey]) {
      groups[moduleKey] = [];
    }
    groups[moduleKey].push(testCase);
  });

  return groups;
}

/**
 * Filter test cases by workflow status
 */
export function filterTestCasesByStatus<T extends { workflowStatus: WorkflowStatus }>(
  testCases: T[],
  status: WorkflowStatus
): T[] {
  return testCases.filter((tc) => tc.workflowStatus === status);
}

/**
 * Extract test cases from query result
 * Safely handles different query result structures
 */
export function extractTestCasesFromQuery<T>(
  queryResult: any,
  testCaseKey: string = "testCases"
): T[] {
  if (!queryResult) return [];
  
  if (Array.isArray(queryResult)) return queryResult;
  
  if (testCaseKey in queryResult && Array.isArray(queryResult[testCaseKey])) {
    return queryResult[testCaseKey];
  }
  
  return [];
}

/**
 * Create default checkbox handlers
 */
export interface CheckboxHandlers {
  handleCheckboxChange: (testCaseId: string, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  handleModuleCheckboxChange: (moduleId: string, checked: boolean) => void;
  getModuleCheckboxState: (moduleId: string) => {
    isChecked: boolean;
    isIndeterminate: boolean;
  };
}

/**
 * Create checkbox handler functions
 */
export function createCheckboxHandlers<T extends BaseTestCase>(
  testCases: T[],
  selectedRows: Set<string>,
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<string>>>,
  groupedTestCases: GroupedTestCases<T>
): CheckboxHandlers {
  return {
    handleCheckboxChange: (testCaseId: string, checked: boolean) => {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(testCaseId);
        } else {
          newSet.delete(testCaseId);
        }
        return newSet;
      });
    },

    handleSelectAll: (checked: boolean) => {
      if (checked) {
        const allIds = new Set(testCases.map((tc) => tc._id));
        setSelectedRows(allIds);
      } else {
        setSelectedRows(new Set());
      }
    },

    handleModuleCheckboxChange: (moduleId: string, checked: boolean) => {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        const moduleTestCases = groupedTestCases[moduleId] || [];

        if (checked) {
          moduleTestCases.forEach((tc) => newSet.add(tc._id));
        } else {
          moduleTestCases.forEach((tc) => newSet.delete(tc._id));
        }

        return newSet;
      });
    },

    getModuleCheckboxState: (moduleId: string) => {
      const moduleTestCases = groupedTestCases[moduleId] || [];
      const selectedCount = moduleTestCases.filter((tc) =>
        selectedRows.has(tc._id)
      ).length;

      return {
        isChecked:
          selectedCount === moduleTestCases.length &&
          moduleTestCases.length > 0,
        isIndeterminate:
          selectedCount > 0 && selectedCount < moduleTestCases.length,
      };
    },
  };
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
}

/**
 * Format test case ID
 */
export function formatTestCaseId(sequenceNumber: number): string {
  return `TC_${String(sequenceNumber).padStart(3, "0")}`;
}

/**
 * Common table cell styles
 */
export const tableCellStyles = {
  base: "border border-gray-300 px-3 py-2 text-sm text-gray-900",
  wrapped: "border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap",
  center: "border border-gray-300 px-2 py-2 text-center",
  hover: "hover:bg-gray-50 relative",
};

/**
 * Validate required fields for new test case
 */
export function validateRequiredFields(
  fields: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    (field) => !fields[field] || (typeof fields[field] === "string" && !fields[field].trim())
  );

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Create alert message for batch update results
 */
export function createBatchUpdateMessage(result: {
  summary: { successful: number; failed: number };
}): string {
  const { successful, failed } = result.summary;

  if (failed > 0) {
    return `Successfully sent ${successful} test case(s) for QA Lead approval!\n\nFailed: ${failed}`;
  }
  
  return `Successfully sent ${successful} test case(s) for QA Lead approval!`;
}

/**
 * Default column configuration
 */
export const defaultColumnConfig = {
  checkbox: { key: "checkbox", label: "", width: 30 },
  workflowStatus: { key: "workflowStatus", label: "Workflow Status", width: 200 },
  tcId: { key: "tcId", label: "TC ID", width: 80 },
  module: { key: "module", label: "Module", width: 150 },
  subModule: { key: "subModule", label: "Sub Module", width: 150 },
  createdBy: { key: "createdBy", label: "Created By", width: 150 },
  createdAt: { key: "createdAt", label: "Date of Creation", width: 130 },
  executedBy: { key: "executedBy", label: "Executed By", width: 150 },
  jiraUserStory: { key: "jiraUserStory", label: "Jira User Story", width: 180 },
};