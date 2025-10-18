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
import { toast } from "sonner";
import {
  WorkflowStatus,
  StatusCounts,
  BaseTestCase,
  TableColumn,
  GroupedTestCases,
  ModuleCheckboxState,
  ColorConfig,
} from "@/components/sheet/common/types/testCaseTypes";
import { ChecklistCreationModal } from "./ChecklistCreationModal";

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
  sheetId: Id<"sheets">; 
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
    preselectedModuleId?: string;
  }) => ReactNode;
  
  // CRUD operations
  onSaveNew?: () => Promise<void>;
  onCancelNew?: () => void;
  onSaveSuccess?: () => void;
  
  // New row state management
  isAdding?: boolean;
  isSaving?: boolean;
  onAddNew?: (moduleId?: string) => void;
  
  // Batch operations
  batchUpdateMutation: any;
  updateRowHeightMutation: any;
  
  // Custom empty state
  emptyStateMessage?: string;
  emptyStateButtonText?: string;
}

/**
 * Component to wrap ModuleNamebar with access data
 */
function ModuleNamebarWithAccess({
  moduleId,
  sheetId,
  moduleName,
  itemCount,
  bgColor,
  textColor,
  isChecked,
  isIndeterminate,
  onCheckboxChange,
  onAddClick,
  isCheckboxDisabled = false,
}: {
  moduleId: Id<"modules">;
  sheetId: Id<"sheets">;
  moduleName: string;
  itemCount: number;
  bgColor: string;
  textColor: string;
  isChecked: boolean;
  isIndeterminate: boolean;
  onCheckboxChange: (checked: boolean) => void;
  onAddClick: () => void;
  isCheckboxDisabled?: boolean;
}) {
  // Fetch access data for this specific module
  const accessData = useQuery(api.myFunctions.getUserModuleAccess, {
    moduleId: moduleId,
    sheetId: sheetId,
  });

  return (
    <ModuleNamebar
      title={moduleName}
      itemCount={itemCount}
      bgColor={bgColor}
      textColor={textColor}
      isChecked={isChecked}
      isIndeterminate={isIndeterminate}
      onCheckboxChange={onCheckboxChange}
      moduleId={moduleId}
      sheetId={sheetId}
      currentUserRole={accessData?.role}
      currentUserModuleAccessStatus={accessData?.moduleAccessStatus}
      onAddClick={onAddClick}
      isCheckboxDisabled={isCheckboxDisabled}
    />
  );
}

/**
 * BaseTable Component
 * A generic, reusable table component for test cases with module grouping,
 * workflow status filtering, batch operations, and resize functionality.
 */
export function BaseTable<T extends BaseTestCase>({
  testCases,
  sheetId,
  modules,
  activeWorkflowStatus,
  onWorkflowStatusChange,
  statusCounts,
  columns,
  testCaseType,
  renderTestCaseRow,
  renderNewTestCaseRow,
  onSaveNew,
  onCancelNew,
  onSaveSuccess,
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

  // ✅ NEW: Dynamic checklist mutation based on test case type
  const createChecklistFunctionality = useMutation(api.myFunctions.createChecklistFromSheetFunctionality);
  const createChecklistAltText = useMutation(api.myFunctions.createChecklistFromSheetAltText);

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
  const [activeAddingModuleId, setActiveAddingModuleId] = useState<string | null>(null);
  const [previousWorkflowStatus, setPreviousWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
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

  // ✅ NEW: Checklist creation handler
  const handleCreateChecklist = () => {
    if (selectedRows.size === 0) {
      toast.error("Please select at least one approved test case.");
      return;
    }
    setIsChecklistModalOpen(true);
  };

  // ✅ UPDATED: Checklist submission handler (supports multiple executors)
  const handleChecklistSubmit = async (data: {
    sprintName: string;
    titleRevisionNumber: string;
    testExecutorAssigneeIds: string[]; // ✅ Changed from single ID to array
    goalDateToFinish: number;
    description?: string;
  }) => {
    try {
      // Use the appropriate mutation based on test case type
      const createChecklistMutation = testCaseType === "functionality" 
        ? createChecklistFunctionality 
        : createChecklistAltText;

      const result = await createChecklistMutation({
        sheetId,
        selectedTestCaseIds: Array.from(selectedRows),
        sprintName: data.sprintName,
        titleRevisionNumber: data.titleRevisionNumber,
        testExecutorAssigneeIds: data.testExecutorAssigneeIds.map(id => id as Id<"users">), // ✅ Map array
        goalDateToFinish: data.goalDateToFinish,
        description: data.description,
      });

      toast.success(result.message || "Checklist created successfully!", {
        duration: 3000,
      });

      // Clear selection and close modal
      setSelectedRows(new Set());
      setIsChecklistModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create checklist";
      toast.error(message, {
        duration: 4000,
      });
    }
  };

  // Handle module-specific add click
  const handleModuleAddClick = (moduleId: string) => {
    // Save current status before switching to "Open"
    if (activeWorkflowStatus !== "Open") {
      setPreviousWorkflowStatus(activeWorkflowStatus);
      onWorkflowStatusChange("Open");
    }
    
    setActiveAddingModuleId(moduleId);
    if (onAddNew) {
      onAddNew(moduleId);
    }
  };

  // Handle cancel - reset active module and restore previous status
  const handleCancel = () => {
    setActiveAddingModuleId(null);
    
    // Restore previous workflow status if it was changed
    if (previousWorkflowStatus !== null) {
      onWorkflowStatusChange(previousWorkflowStatus);
      setPreviousWorkflowStatus(null);
    }
    
    if (onCancelNew) {
      onCancelNew();
    }
  };

  // Handle save with toast notification
  const handleSave = async () => {
    if (!onSaveNew) return;
    
    try {
      await onSaveNew();
      
      // Show success toast
      toast.success("Test case added successfully!", {
        duration: 3000,
      });
      
      // Reset state
      setActiveAddingModuleId(null);
      
      // Restore previous workflow status if it was changed
      if (previousWorkflowStatus !== null) {
        onWorkflowStatusChange(previousWorkflowStatus);
        setPreviousWorkflowStatus(null);
      }
      
      // Call the success callback if provided
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      // Show error toast
      const message = error instanceof Error ? error.message : "Failed to add test case";
      toast.error(message, {
        duration: 4000,
      });
    }
  };

  // Handle global add (when clicking the main add button)
  const handleGlobalAdd = () => {
    // Save current status before switching to "Open"
    if (activeWorkflowStatus !== "Open") {
      setPreviousWorkflowStatus(activeWorkflowStatus);
      onWorkflowStatusChange("Open");
    }
    
    if (onAddNew) {
      onAddNew();
    }
  };

  return (
    <div className="flex flex-col relative">
      {/* Overlay when adding new test case */}
      {isAdding && (
        <div 
          className="fixed inset-0 z-40"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            pointerEvents: 'none' 
          }}
        />
      )}

      {/* ✅ Checklist Creation Modal - Works for BOTH test case types */}
      <ChecklistCreationModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        onSubmit={handleChecklistSubmit}
        selectedCount={selectedRows.size}
        sheetId={sheetId}
        testCaseType={testCaseType} // ✅ NEW: Pass test case type
      />

      {/* Top Bar Buttons - Only show when items are selected */}
      {selectedRows.size > 0 && (
        <div className="flex gap-2 justify-start px-4 py-2">
          <Button size="sm" variant="outline" onClick={handleSendToApproval}>
            Send To Approval for QA Lead ({selectedRows.size})
          </Button>
          
          {/* ✅ FIXED: Show for BOTH test case types when in Approved status */}
          {activeWorkflowStatus === "Approved" && (
            <Button 
              size="sm" 
              variant="default" 
              onClick={handleCreateChecklist}
            >
              Create Checklist ({selectedRows.size})
            </Button>
          )}
        </div>
      )}

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
                  onAdd={handleGlobalAdd}
                  buttonText={emptyStateButtonText}
                  colSpan={columns.length}
                  modules={modules}
                  sheetId={sheetId}
                  onModuleAddClick={handleModuleAddClick}
                  isAdding={isAdding}
                  activeAddingModuleId={activeAddingModuleId}
                  renderNewTestCaseRow={renderNewTestCaseRow}
                  getColumnWidth={getColumnWidth}
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
            ) : testCases.length === 0 && isAdding ? (
              /* Empty state with modules but in adding mode */
              <>
                {modules.map((module, index) => {
                  const color = getModuleColor(index);
                  return (
                    <React.Fragment key={module._id}>
                      {/* Module Namebar Row */}
                      <tr style={{ height: '46px' }}>
                        <td colSpan={columns.length} className="p-0 relative">
                          <ModuleNamebarWithAccess
                            moduleId={module._id}
                            sheetId={sheetId}
                            moduleName={module.name}
                            itemCount={0}
                            bgColor={color.bgColor}
                            textColor={color.textColor}
                            isChecked={false}
                            isIndeterminate={false}
                            onCheckboxChange={() => {}}
                            onAddClick={() => handleModuleAddClick(module._id)}
                            isCheckboxDisabled={true}
                          />
                        </td>
                      </tr>
                      
                      {/* Show input row directly after this module's namebar if active */}
                      {isAdding && activeAddingModuleId === module._id && renderNewTestCaseRow && (
                        <tr className="relative z-50">
                          <td colSpan={columns.length} className="p-0">
                            <div className="relative">
                              {renderNewTestCaseRow({
                                getColumnWidth,
                                preselectedModuleId: module._id,
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <>
                {modules.map((module, index) => {
                  const moduleId = module._id;
                  const moduleName = module.name;
                  const color = getModuleColor(index);
                  
                  // Get test cases for this module (may be empty array)
                  const moduleTestCases = groupedTestCases[moduleId] || [];
                  
                  const { isChecked, isIndeterminate } = getModuleCheckboxState(moduleId);

                  return (
                    <React.Fragment key={moduleId}>
                      {/* Module Name Bar - ALWAYS rendered */}
                      <tr style={{ height: '46px' }}>
                        <td colSpan={columns.length} className="p-0 relative">
                          <ModuleNamebarWithAccess
                            moduleId={moduleId}
                            sheetId={sheetId}
                            moduleName={moduleName}
                            itemCount={moduleTestCases.length}
                            bgColor={color.bgColor}
                            textColor={color.textColor}
                            isChecked={isChecked}
                            isIndeterminate={isIndeterminate}
                            onCheckboxChange={(checked) =>
                              handleModuleCheckboxChange(moduleId, checked)
                            }
                            onAddClick={() => handleModuleAddClick(moduleId)}
                            isCheckboxDisabled={moduleTestCases.length === 0}
                          />
                        </td>
                      </tr>
                      
                      {/* Show input row directly after this module's namebar if active */}
                      {isAdding && activeAddingModuleId === moduleId && renderNewTestCaseRow && (
                        <tr className="relative z-50">
                          <td colSpan={columns.length} className="p-0">
                            <div className="relative">
                              {renderNewTestCaseRow({
                                getColumnWidth,
                                preselectedModuleId: moduleId,
                              })}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Test Cases for this module (if any) */}
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
                })}
                
                {/* Handle ungrouped test cases (if any) */}
                {groupedTestCases["ungrouped"]?.map((testCase) => (
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
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Row Button - Only show when actively adding */}
      {isAdding && onSaveNew && onCancelNew && (
        <div className="-ml-3 fixed shadow-md bsolute top-0 bg-white w-full z-40">
          <TableActionButtons
            isAdding={isAdding}
            isSaving={isSaving}
            onAdd={() => {}}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
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