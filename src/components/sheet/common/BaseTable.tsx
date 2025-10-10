// src/components/sheet/common/BaseTable.tsx

import React, { useState, useRef, useMemo, ReactNode } from "react";
import { Doc, Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useColumnResize } from "../../../hooks/useColumnResize";
import { useRowResize } from "../../../hooks/useRowResize";
import { useColumnWidths } from "../../../hooks/useColumnWidths";
import { TableHeaderCell } from "./TableHeaderCell";
import { TableActionButtons } from "./TableActionButtons";
import { EmptyTableState } from "./EmptyTableState";
import { ResizeFeedback } from "./ResizeFeedback";
import { ModuleNamebar } from "./ModuleNamebar";
import { Button } from "@/components/ui/button";
import { SheetNavigationBar } from "./SheetNavigationBar";
import {
  WorkflowStatus,
  StatusCounts,
  BaseTestCase,
  TableColumn,
  GroupedTestCases,
  ModuleCheckboxState,
  ColorConfig,
} from "@/components/sheet/common/types/testCaseTypes";

/**
 * Props for the BaseTable component
 */
interface BaseTableProps<T extends {
  _id: string;
  module?: Id<"modules">;
  moduleName: string;
  workflowStatus: WorkflowStatus;
  sequenceNumber: number;
  rowHeight?: number;
  createdAt: number;
  createdByName: string;
  executedByName: string;
}> {
  // Data
  testCases: T[];
  sheetId: string;
  modules: Doc<"modules">[];
  
  // Workflow status management
  activeWorkflowStatus: WorkflowStatus;
  onWorkflowStatusChange: (status: WorkflowStatus) => void;
  statusCounts?: StatusCounts;
  
  // Table configuration
  columns: TableColumn[];
  testCaseType: "functionality" | "altTextAriaLabel";
  
  // Row rendering
  renderTestCaseRow: (
    testCase: T,
    helpers: {
      handleCheckboxChange: (testCaseId: string, checked: boolean) => void;
      handleRowMouseDown: (e: React.MouseEvent, testCaseId: string, currentHeight: number) => void;
      selectedRows: Set<string>;
      getColumnWidth: (key: string, defaultWidth: number) => number;
      resizingRow: string | null;
    }
  ) => ReactNode;
  renderNewTestCaseRow?: (helpers: {
    getColumnWidth: (key: string, defaultWidth: number) => number;
  }) => ReactNode;
  
  // CRUD operations
  onSaveNew?: () => Promise<void>;
  onCancelNew?: () => void;
  
  // New row state management
  isAdding?: boolean;
  isSaving?: boolean;
  onAddNew?: () => void;
  
  // Batch operations
  batchUpdateMutation: any;
  updateRowHeightMutation: any;
  
  // Custom empty state
  emptyStateMessage?: string;
  emptyStateButtonText?: string;
}

/**
 * BaseTable Component
 * A generic, reusable table component for test cases with module grouping,
 * workflow status filtering, batch operations, and resize functionality.
 */
export function BaseTable<T extends BaseTestCase>({
  testCases,
  sheetId,
  activeWorkflowStatus,
  onWorkflowStatusChange,
  statusCounts,
  columns,
  testCaseType,
  renderTestCaseRow,
  renderNewTestCaseRow,
  onSaveNew,
  onCancelNew,
  isAdding = false,
  isSaving = false,
  onAddNew,
  batchUpdateMutation,
  updateRowHeightMutation,
  emptyStateMessage,
  emptyStateButtonText = "Add First Test Case",
}: BaseTableProps<T>) {
  // Fetch column widths
  const fetchedColumnWidths = useQuery(api.myFunctions.getColumnWidths, {
    sheetId,
    testCaseType,
  });
  const updateColumnWidth = useMutation(api.myFunctions.updateColumnWidth);

  // Custom Hooks
  const { getColumnWidth } = useColumnWidths(fetchedColumnWidths);
  const { resizingRow, handleRowMouseDown } = useRowResize({
    onResizeComplete: async (testCaseId, rowHeight) => {
      await updateRowHeightMutation({ testCaseId, rowHeight });
    },
  });
  const { resizingColumn, handleColumnMouseDown } = useColumnResize({
    onResizeComplete: async (columnName, width) => {
      await updateColumnWidth({
        sheetId,
        columnName,
        width,
        testCaseType,
      });
    },
  });

  // Local state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLTableElement>(null);

  // Group test cases by module
  const groupedTestCases: GroupedTestCases<T> = useMemo(() => {
    const groups: Record<string, T[]> = {};

    testCases.forEach((testCase) => {
      const moduleKey = testCase.module || "ungrouped";
      if (!groups[moduleKey]) {
        groups[moduleKey] = [];
      }
      groups[moduleKey].push(testCase);
    });

    return groups;
  }, [testCases]);

  // Generate module colors
  const getModuleColor = (index: number): ColorConfig => {
    const hue = (index * 137.5) % 360;
    const bgColor = `hsl(${hue}, 70%, 85%)`;
    const textColor = "#333333";
    return { bgColor, textColor };
  };

  // Checkbox handlers
  const handleCheckboxChange = (testCaseId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(testCaseId);
      } else {
        newSet.delete(testCaseId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(testCases.map((tc) => tc._id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleModuleCheckboxChange = (moduleId: string, checked: boolean) => {
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
  };

  const getModuleCheckboxState = (moduleId: string): ModuleCheckboxState => {
    const moduleTestCases = groupedTestCases[moduleId] || [];
    const selectedCount = moduleTestCases.filter((tc) =>
      selectedRows.has(tc._id)
    ).length;

    return {
      isChecked:
        selectedCount === moduleTestCases.length && moduleTestCases.length > 0,
      isIndeterminate:
        selectedCount > 0 && selectedCount < moduleTestCases.length,
    };
  };

  const isAllSelected =
    testCases.length > 0 && selectedRows.size === testCases.length;
  const isIndeterminate =
    selectedRows.size > 0 && selectedRows.size < testCases.length;

  // Batch operations
  const handleSendToApproval = async () => {
    if (selectedRows.size === 0) {
      alert("Please select at least one test case to send for approval.");
      return;
    }

    const selectedIds = Array.from(selectedRows);
    try {
      const result = await batchUpdateMutation({
        testCaseIds: selectedIds,
        workflowStatus: "Waiting for QA Lead Approval",
      });

      if (result.summary.failed > 0) {
        alert(
          `Successfully sent ${result.summary.successful} test case(s) for QA Lead approval!\n\nFailed: ${result.summary.failed}`
        );
      } else {
        alert(
          `Successfully sent ${result.summary.successful} test case(s) for QA Lead approval!`
        );
      }
      setSelectedRows(new Set());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert("Failed to send for approval: " + message);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Top Bar Button */}
      <div className="flex justify-start px-4">
        <Button onClick={handleSendToApproval}>
          Send To Approval for QA Lead{" "}
          {selectedRows.size > 0 && `(${selectedRows.size})`}
        </Button>
      </div>

      {/* Navigation Bar with Status Filter */}
      <SheetNavigationBar
        activeStatus={activeWorkflowStatus}
        onStatusChange={onWorkflowStatusChange}
        statusCounts={statusCounts}
      />

      {/* Scrollable table container */}
      <div
        className="overflow-x-auto overflow-y-visible"
        style={{ maxWidth: "100%" }}
      >
        <table
          ref={tableRef}
          className="w-full border-collapse"
          style={{ minWidth: "max-content" }}
        >
          <thead>
            <tr className="bg-gray-100">
              {columns.map(({ key, label, width }) => {
                if (key === "checkbox") {
                  return (
                    <th
                      key={key}
                      style={{ width: `${getColumnWidth(key, width)}px` }}
                      className="border border-gray-300 px-2 py-2 text-center bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="cursor-pointer"
                      />
                    </th>
                  );
                }

                return (
                  <TableHeaderCell
                    key={key}
                    columnKey={key}
                    label={label}
                    width={getColumnWidth(key, width)}
                    isResizing={resizingColumn === key}
                    onResizeStart={handleColumnMouseDown}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {testCases.length === 0 && !isAdding ? (
              onAddNew ? (
                <EmptyTableState
                  message={
                    emptyStateMessage ||
                    `No ${activeWorkflowStatus.toLowerCase()} test cases found.`
                  }
                  onAdd={onAddNew}
                  buttonText={emptyStateButtonText}
                  colSpan={columns.length}
                />
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                  >
                    {emptyStateMessage ||
                      `No ${activeWorkflowStatus.toLowerCase()} test cases found.`}
                  </td>
                </tr>
              )
            ) : (
              <>
                {Object.entries(groupedTestCases).map(
                  ([moduleId, moduleTestCases], groupIndex) => {
                    const moduleName =
                      moduleTestCases[0]?.moduleName || "Unknown Module";
                    const color = getModuleColor(groupIndex);
                    const { isChecked, isIndeterminate } =
                      getModuleCheckboxState(moduleId);

                    return (
                      <React.Fragment key={moduleId}>
                        {/* Module Name Bar with Checkbox */}
                        <tr>
                          <td colSpan={columns.length} className="p-0">
                            <ModuleNamebar
                              title={`${moduleName} (${moduleTestCases.length})`}
                              bgColor={color.bgColor}
                              textColor={color.textColor}
                              isChecked={isChecked}
                              isIndeterminate={isIndeterminate}
                              onCheckboxChange={(checked) =>
                                handleModuleCheckboxChange(moduleId, checked)
                              }
                            />
                          </td>
                        </tr>
                        {/* Test Cases for this module */}
                        {moduleTestCases.map((testCase) => (
                          <React.Fragment key={testCase._id}>
                            {renderTestCaseRow(testCase, {
                              handleCheckboxChange,
                              handleRowMouseDown,
                              selectedRows,
                              getColumnWidth,
                              resizingRow,
                            })}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    );
                  }
                )}

                {/* New Row Input */}
                {isAdding && renderNewTestCaseRow && renderNewTestCaseRow({
                  getColumnWidth,
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Row Button */}
      {(testCases.length > 0 || isAdding) && onAddNew && onSaveNew && onCancelNew && (
        <TableActionButtons
          isAdding={isAdding}
          isSaving={isSaving}
          onAdd={onAddNew}
          onSave={onSaveNew}
          onCancel={onCancelNew}
        />
      )}

      {/* Visual feedback during resize */}
      <ResizeFeedback
        isResizingRow={!!resizingRow}
        isResizingColumn={!!resizingColumn}
      />
    </div>
  );
}

/**
 * Export helper functions for use in specific table implementations
 */
export const tableHelpers = {
  getModuleColor: (index: number): ColorConfig => {
    const hue = (index * 137.5) % 360;
    const bgColor = `hsl(${hue}, 70%, 85%)`;
    const textColor = "#333333";
    return { bgColor, textColor };
  },
};