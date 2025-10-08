// src/components/sheet/alttextarialabel/AltTextAriaLabelTable.tsx
import React, { useState, useRef } from "react";
import { Doc } from "convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useColumnResize } from "../../../hooks/useColumnResize";
import { useRowResize } from "../../../hooks/useRowResize";
import { useColumnWidths } from "../../../hooks/useColumnWidths";
import { TableHeaderCell } from "../common/TableHeaderCell";
import { ResizeHandle } from "../common/ResizeHandle";
import { TableActionButtons } from "../common/TableActionButtons";
import { EmptyTableState } from "../common/EmptyTableState";
import { ResizeFeedback } from "../common/ResizeFeedback";
import { formatWithNumbering } from "../../../utils/formatUtils";
import { SEImplementationBadge, TestingStatusBadge } from "../common/StatusBadgeHelper";
import { NumberedTextarea } from "../NumberedTextarea";
import { WorkflowStatusBadge, WorkflowStatus } from "../common/WorkflowStatusBadge";
import { Button } from "@/components/ui/button";
import { SheetNavigationBar } from "../sheet-navigation-bar";

// --- AltTextAriaLabelTable Component ---
interface AltTextAriaLabelTableProps {
  testCases: (Doc<"altTextAriaLabelTestCases"> & { createdByName: string; sequenceNumber: number; workflowStatus: WorkflowStatus; })[];
  sheetId: string;
}

interface NewTestCase {
  persona: "Super Admin" | "Admin" | "User" | "Employee" | "Reporting Manager" | "Manager";
  module: string;
  subModule: string;
  pageSection: string;
  wireframeLink: string;
  imagesIcons: string;
  remarks: string;
  altTextAriaLabel: string;
  seImplementation: "Not yet" | "Ongoing" | "Done" | "Has Concerns" | "To Update" | "Outdated" | "Not Available";
  actualResults: string;
  testingStatus: "Passed" | "Failed" | "Not Run" | "Blocked" | "Not Available";
  notes: string;
  jiraUserStory: string;
}

const initialNewTestCaseState: NewTestCase = {
  persona: "User",
  module: "",
  subModule: "",
  pageSection: "",
  wireframeLink: "",
  imagesIcons: "",
  remarks: "",
  altTextAriaLabel: "",
  seImplementation: "Not yet",
  actualResults: "",
  testingStatus: "Not Run",
  notes: "",
  jiraUserStory: "",
};

const ALT_TEXT_ARIA_LABEL_COLUMNS = [
  { key: "checkbox", label: "", width: 30 },
  { key: "workflowStatus", label: "Workflow Status", width: 200 },
  { key: "sequenceNumber", label: "TC ID", width: 80 },
  { key: "persona", label: "Persona", width: 150 },
  { key: "module", label: "Module", width: 150 },
  { key: "subModule", label: "Sub Module", width: 150 },
  { key: "pageSection", label: "Page Section", width: 150 },
  { key: "wireframeLink", label: "Wireframe Link", width: 150 },
  { key: "imagesIcons", label: "Images/Icons", width: 200 },
  { key: "remarks", label: "Remarks", width: 250 },
  { key: "altTextAriaLabel", label: "Alt Text/Aria Label", width: 300 },
  { key: "seImplementation", label: "SE Implementation", width: 150 },
  { key: "actualResults", label: "Actual Results", width: 250 },
  { key: "testingStatus", label: "Testing Status", width: 120 },
  { key: "notes", label: "Notes", width: 250 },
  { key: "jiraUserStory", label: "Jira User Story", width: 150 },
  { key: "createdByName", label: "Created By", width: 150 },
];

export function AltTextAriaLabelTable({ testCases, sheetId }: AltTextAriaLabelTableProps) {
  // Mutations
  const updateRowHeight = useMutation(api.myFunctions.updateAltTextAriaLabelTestCaseRowHeight);
  const createTestCase = useMutation(api.myFunctions.createAltTextAriaLabelTestCase);
  const updateColumnWidth = useMutation(api.myFunctions.updateColumnWidth);
  const batchUpdateWorkflowStatus = useMutation(api.myFunctions.batchUpdateAltTextAriaLabelWorkflowStatus);

  // Queries
  const fetchedColumnWidths = useQuery(api.myFunctions.getColumnWidths, {
    sheetId,
    testCaseType: "altTextAriaLabel",
  });

  // Custom Hooks
  const { getColumnWidth } = useColumnWidths(fetchedColumnWidths);
  const { resizingRow, handleRowMouseDown } = useRowResize({
    onResizeComplete: async (testCaseId, rowHeight) => {
      await updateRowHeight({ testCaseId, rowHeight });
    }
  });
  const { resizingColumn, handleColumnMouseDown } = useColumnResize({
    onResizeComplete: async (columnName, width) => {
      await updateColumnWidth({ sheetId, columnName, width, testCaseType: "altTextAriaLabel" });
    }
  });

  // State
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTestCase, setNewTestCase] = useState<NewTestCase>(initialNewTestCaseState);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLTableElement>(null);

  // --- Event Handlers ---
  const handleCheckboxChange = (testCaseId: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(testCaseId);
        console.log('Row selected:', testCaseId);
      } else {
        newSet.delete(testCaseId);
        console.log('Row deselected:', testCaseId);
      }
      console.log('Currently selected rows:', Array.from(newSet));
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(testCases.map(tc => tc._id));
      setSelectedRows(allIds);
      console.log('All rows selected:', Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      console.log('All rows deselected');
    }
  };

  const isAllSelected = testCases.length > 0 && selectedRows.size === testCases.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < testCases.length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTestCase((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberedTextareaChange = (name: keyof NewTestCase, value: string) => {
    setNewTestCase((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNew = async () => {
    if (!newTestCase.persona || !newTestCase.module || !newTestCase.altTextAriaLabel) {
      alert("Persona, Module, and Alt Text/Aria Label fields are required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...newTestCase,
        imagesIcons: formatWithNumbering(newTestCase.imagesIcons),
        remarks: formatWithNumbering(newTestCase.remarks),
        altTextAriaLabel: formatWithNumbering(newTestCase.altTextAriaLabel),
        actualResults: formatWithNumbering(newTestCase.actualResults),
        notes: formatWithNumbering(newTestCase.notes),
      };

      await createTestCase({
        sheetId,
        ...payload
      });

      setNewTestCase(initialNewTestCaseState);
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create test case:", error);
      alert("Error: Could not save the new test case.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNew = () => {
    setIsAdding(false);
    setNewTestCase(initialNewTestCaseState);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setNewTestCase(initialNewTestCaseState);
  };

  const handleSendToApproval = async () => {
    if (selectedRows.size === 0) {
      alert('Please select at least one test case to send for approval.');
      return;
    }

    const selectedIds = Array.from(selectedRows);
    
    try {
      const result = await batchUpdateWorkflowStatus({
        testCaseIds: selectedIds,
        workflowStatus: "Waiting for QA Lead Approval",
      });

      if (result.summary.failed > 0) {
        alert(`Successfully sent ${result.summary.successful} test case(s) for QA Lead approval!\n\nFailed: ${result.summary.failed}`);
      } else {
        alert(`Successfully sent ${result.summary.successful} test case(s) for QA Lead approval!`);
      }
      
      setSelectedRows(new Set());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Failed to send for approval: ' + message);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Top Bar Button */}
      <div className="flex justify-end px-4">
        <Button onClick={handleSendToApproval}>
          Send To Approval for QA Lead
          {selectedRows.size > 0 && (
            ` (${selectedRows.size})`
          )}
        </Button>
      </div>
        <SheetNavigationBar />

      {/* Scrollable table container */}
      <div className="overflow-x-auto overflow-y-visible" style={{ maxWidth: '100%' }}>
        <table ref={tableRef} className="w-full border-collapse" style={{ minWidth: 'max-content' }}>
          <thead>
            <tr className="bg-gray-100">
              {ALT_TEXT_ARIA_LABEL_COLUMNS.map(({ key, label, width }) => {
                // Special handling for checkbox column header
                if (key === 'checkbox') {
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
              <EmptyTableState
                message="No Alt Text / Aria Label test cases found."
                onAdd={handleAddNew}
                buttonText="Add First Test Case"
                colSpan={ALT_TEXT_ARIA_LABEL_COLUMNS.length}
              />
            ) : (
              <>
                {testCases.map((testCase) => (
                  <tr
                    key={testCase._id}
                    data-testcase-id={testCase._id}
                    className="hover:bg-gray-50 relative"
                    style={{ height: `${testCase.rowHeight || 20}px` }}
                  >
                    {ALT_TEXT_ARIA_LABEL_COLUMNS.map(({ key, width }) => {
                      // Checkbox column (first column)
                      if (key === 'checkbox') {
                        return (
                          <td
                            key={key}
                            data-column={key}
                            style={{ width: `${getColumnWidth(key, width)}px` }}
                            className="border border-gray-300 px-2 py-2 text-center"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRows.has(testCase._id)}
                              onChange={(e) => handleCheckboxChange(testCase._id, e.target.checked)}
                              className="cursor-pointer"
                            />
                          </td>
                        );
                      }

                      // Special rendering for workflow status (second column)
                      if (key === 'workflowStatus') {
                        return (
                          <td
                            key={key}
                            data-column={key}
                            style={{ width: `${getColumnWidth(key, width)}px` }}
                            className="border border-gray-300 px-3 py-2"
                          >
                            <WorkflowStatusBadge status={testCase.workflowStatus} />
                          </td>
                        );
                      }

                      // Regular rendering for other columns
                      return (
                        <td
                          key={key}
                          data-column={key}
                          style={{ width: `${getColumnWidth(key, width)}px` }}
                          className="border border-gray-300 px-3 py-2 text-sm text-gray-900 align-top break-words whitespace-pre-wrap"
                        >
                          {key === 'testingStatus' ? (
                            <TestingStatusBadge status={testCase[key] as any} />
                          ) : key === 'seImplementation' ? (
                            <SEImplementationBadge status={testCase[key] as any} />
                          ) : (
                            testCase[key as keyof typeof testCase] ?? "N/A"
                          )}
                        </td>
                      );
                    })}
                    <ResizeHandle
                      direction="row"
                      isResizing={resizingRow === testCase._id}
                      onMouseDown={(e) => handleRowMouseDown(e, testCase._id, testCase.rowHeight || 20)}
                    />
                  </tr>
                ))}

                {/* New Row Input */}
                {isAdding && (
                  <tr className="bg-blue-50">
                    {/* Checkbox - Empty for new row */}
                    <td
                      data-column="checkbox"
                      style={{ width: `${getColumnWidth("checkbox", 30)}px` }}
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                      {/* Empty checkbox cell for new row */}
                    </td>

                    {/* Workflow Status - New (defaults to Open, read-only) */}
                    <td
                      data-column="workflowStatus"
                      style={{ width: `${getColumnWidth("workflowStatus", 200)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <WorkflowStatusBadge status="Open" />
                    </td>

                    <td
                      data-column="sequenceNumber"
                      style={{ width: `${getColumnWidth("sequenceNumber", 80)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      TC_{String(testCases.length + 1).padStart(3, '0')}
                    </td>

                    <td
                      data-column="persona"
                      style={{ width: `${getColumnWidth("persona", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        name="persona"
                        value={newTestCase.persona}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Employee">Employee</option>
                        <option value="Reporting Manager">Reporting Manager</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </td>

                    <td
                      data-column="module"
                      style={{ width: `${getColumnWidth("module", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        name="module"
                        value={newTestCase.module}
                        onChange={handleInputChange}
                        placeholder="Module *"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    <td
                      data-column="subModule"
                      style={{ width: `${getColumnWidth("subModule", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        name="subModule"
                        value={newTestCase.subModule}
                        onChange={handleInputChange}
                        placeholder="Sub Module"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    <td
                      data-column="pageSection"
                      style={{ width: `${getColumnWidth("pageSection", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        name="pageSection"
                        value={newTestCase.pageSection}
                        onChange={handleInputChange}
                        placeholder="Page Section"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    <td
                      data-column="wireframeLink"
                      style={{ width: `${getColumnWidth("wireframeLink", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        name="wireframeLink"
                        value={newTestCase.wireframeLink}
                        onChange={handleInputChange}
                        placeholder="Wireframe Link"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    <td
                      data-column="imagesIcons"
                      style={{ width: `${getColumnWidth("imagesIcons", 200)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <NumberedTextarea
                        value={newTestCase.imagesIcons}
                        onChange={(v) => handleNumberedTextareaChange('imagesIcons', v)}
                        placeholder="Images/Icons"
                        rows={2}
                        className="text-sm"
                      />
                    </td>

                    <td
                      data-column="remarks"
                      style={{ width: `${getColumnWidth("remarks", 250)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <NumberedTextarea
                        value={newTestCase.remarks}
                        onChange={(v) => handleNumberedTextareaChange('remarks', v)}
                        placeholder="Remarks"
                        rows={2}
                        className="text-sm"
                      />
                    </td>

                    <td
                      data-column="altTextAriaLabel"
                      style={{ width: `${getColumnWidth("altTextAriaLabel", 300)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <NumberedTextarea
                        value={newTestCase.altTextAriaLabel}
                        onChange={(v) => handleNumberedTextareaChange('altTextAriaLabel', v)}
                        placeholder="Alt Text/Aria Label *"
                        rows={2}
                        className="text-sm"
                      />
                    </td>

                    <td
                      data-column="seImplementation"
                      style={{ width: `${getColumnWidth("seImplementation", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        name="seImplementation"
                        value={newTestCase.seImplementation}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Not yet">Not yet</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Done">Done</option>
                        <option value="Has Concerns">Has Concerns</option>
                        <option value="To Update">To Update</option>
                        <option value="Outdated">Outdated</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </td>

                    <td
                      data-column="actualResults"
                      style={{ width: `${getColumnWidth("actualResults", 250)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <NumberedTextarea
                        value={newTestCase.actualResults}
                        onChange={(v) => handleNumberedTextareaChange('actualResults', v)}
                        placeholder="Actual Results"
                        rows={2}
                        className="text-sm"
                      />
                    </td>

                    <td
                      data-column="testingStatus"
                      style={{ width: `${getColumnWidth("testingStatus", 120)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        name="testingStatus"
                        value={newTestCase.testingStatus}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Not Run">Not Run</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </td>

                    <td
                      data-column="notes"
                      style={{ width: `${getColumnWidth("notes", 250)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <NumberedTextarea
                        value={newTestCase.notes}
                        onChange={(v) => handleNumberedTextareaChange('notes', v)}
                        placeholder="Notes"
                        rows={2}
                        className="text-sm"
                      />
                    </td>

                    <td
                      data-column="jiraUserStory"
                      style={{ width: `${getColumnWidth("jiraUserStory", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        name="jiraUserStory"
                        value={newTestCase.jiraUserStory}
                        onChange={handleInputChange}
                        placeholder="Jira User Story"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    <td
                      data-column="createdByName"
                      style={{ width: `${getColumnWidth("createdByName", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      You
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Row Button */}
      {(testCases.length > 0 || isAdding) && (
        <TableActionButtons
          isAdding={isAdding}
          isSaving={isSaving}
          onAdd={handleAddNew}
          onSave={handleSaveNew}
          onCancel={handleCancelNew}
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