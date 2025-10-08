// src/components/sheet/alttextarialabel/AltTextAriaLabelTable.tsx

import { useState, useRef } from "react";
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
import { TestingStatusBadge } from "../common/StatusBadgeHelper";
import { WorkflowStatusBadge, WorkflowStatus } from "../common/WorkflowStatusBadge";
import { Button } from "@/components/ui/button";
import { SheetNavigationBar } from "../sheet-navigation-bar";
import { SEImplementationBadge } from "../common/SEImplementationBadge";

interface AltTextAriaLabelTableProps {
  testCases: (Doc<"altTextAriaLabelTestCases"> & {
    createdByName: string;
    executedByName: string;
    sequenceNumber: number;
    rowHeight?: number;
    createdAt: number;
    workflowStatus: WorkflowStatus;
  })[];
  sheetId: string;
  activeWorkflowStatus: WorkflowStatus;
  onWorkflowStatusChange: (status: WorkflowStatus) => void;
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
  seImplementation:   | "Not yet"
  | "Ongoing"
  | "Done"
  | "Has Concerns"
  | "To Update"
  | "Outdated"
  | "Not Available";
  actualResults: string;
  testingStatus: "Passed" | "Failed" | "Not Run" | "Blocked" | "Not Available";
  notes: string;
  jiraUserStory: string;
}

export function AltTextAriaLabelTable({
  testCases,
  sheetId,
  activeWorkflowStatus,
  onWorkflowStatusChange,
}: AltTextAriaLabelTableProps) {
  const updateRowHeight = useMutation(
    api.myFunctions.updateAltTextAriaLabelTestCaseRowHeight,
  );
  const createTestCase = useMutation(
    api.myFunctions.createAltTextAriaLabelTestCase,
  );
  const batchUpdateWorkflowStatus = useMutation(
    api.myFunctions.batchUpdateAltTextAriaLabelWorkflowStatus,
  );
  const fetchedColumnWidths = useQuery(api.myFunctions.getColumnWidths, {
    sheetId,
    testCaseType: "altTextAriaLabel",
  });
  const updateColumnWidth = useMutation(api.myFunctions.updateColumnWidth);

  // Fetch all test cases to get counts per status
  const allTestCasesData = useQuery(
    api.myFunctions.getTestCasesForSheet,
    sheetId ? { sheetId } : "skip"
  );

  // Calculate status counts
  const statusCounts = allTestCasesData && 'testCases' in allTestCasesData 
    ? (allTestCasesData.testCases as any[]).reduce((acc, tc) => {
        const status = tc.workflowStatus as WorkflowStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<WorkflowStatus, number>)
    : undefined;

  // Custom Hooks
  const { getColumnWidth } = useColumnWidths(fetchedColumnWidths);
  const { resizingRow, handleRowMouseDown } = useRowResize({
    onResizeComplete: async (testCaseId, rowHeight) => {
      await updateRowHeight({ testCaseId, rowHeight });
    }
  });
  const { resizingColumn, handleColumnMouseDown } = useColumnResize({
    onResizeComplete: async (columnName, width) => {
      await updateColumnWidth({
        sheetId,
        columnName,
        width,
        testCaseType: "altTextAriaLabel"
      });
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTestCase, setNewTestCase] = useState<NewTestCase>({
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
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLTableElement>(null);

  const handleCheckboxChange = (testCaseId: string, checked: boolean) => {
    setSelectedRows(prev => {
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
      const allIds = new Set(testCases.map(tc => tc._id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const isAllSelected = testCases.length > 0 && selectedRows.size === testCases.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < testCases.length;

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

  const handleAddNew = () => {
    setIsAdding(true);
    setNewTestCase({
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
    });
  };

  const handleSaveNew = async () => {
    if (!newTestCase.module.trim() || !newTestCase.pageSection.trim() || !newTestCase.altTextAriaLabel.trim()) {
      alert("Module, Page Section, and Alt Text/Aria Label are required fields.");
      return;
    }

    setIsSaving(true);
    try {
      await createTestCase({
        sheetId,
        persona: newTestCase.persona,
        module: newTestCase.module.trim(),
        subModule: newTestCase.subModule ? newTestCase.subModule.trim() : undefined,
        pageSection: newTestCase.pageSection.trim(),
        wireframeLink: newTestCase.wireframeLink ? newTestCase.wireframeLink.trim() : undefined,
        imagesIcons: newTestCase.imagesIcons ? newTestCase.imagesIcons.trim() : undefined,
        remarks: newTestCase.remarks ? newTestCase.remarks.trim() : undefined,
        altTextAriaLabel: newTestCase.altTextAriaLabel.trim(),
        seImplementation: newTestCase.seImplementation,
        actualResults: newTestCase.actualResults ? newTestCase.actualResults.trim() : undefined,
        testingStatus: newTestCase.testingStatus,
        notes: newTestCase.notes ? newTestCase.notes.trim() : undefined,
        jiraUserStory: newTestCase.jiraUserStory ? newTestCase.jiraUserStory.trim() : undefined,
      });
      setIsAdding(false);
      setNewTestCase({
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
      });
    } catch (error) {
      console.error("Failed to create test case:", error);
      alert("Failed to create test case. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNew = () => {
    setIsAdding(false);
    setNewTestCase({
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
    });
  };

  const columns = [
    { key: "checkbox", label: "", width: 30 },
    { key: "workflowStatus", label: "Workflow Status", width: 200 },
    { key: "tcId", label: "TC ID", width: 80 },
    { key: "persona", label: "Persona", width: 150 },
    { key: "module", label: "Module", width: 150 },
    { key: "subModule", label: "Sub Module", width: 150 },
    { key: "pageSection", label: "Page/Section", width: 180 },
    { key: "wireframeLink", label: "Wireframe Link", width: 180 },
    { key: "imagesIcons", label: "Images/Icons", width: 150 },
    { key: "remarks", label: "Remarks", width: 200 },
    { key: "altTextAriaLabel", label: "Alt Text / Aria Label", width: 250 },
    { key: "seImplementation", label: "SE Implementation", width: 150 },
    { key: "actualResults", label: "Actual Results", width: 200 },
    { key: "testingStatus", label: "Testing Status", width: 120 },
    { key: "executedBy", label: "Executed By", width: 150 },
    { key: "notes", label: "Notes", width: 200 },
    { key: "jiraUserStory", label: "Jira User Story", width: 180 },
    { key: "createdBy", label: "Created By", width: 150 },
    { key: "createdAt", label: "Date of Creation", width: 130 },
  ];

  return (
    <div className="flex flex-col">
      {/* Top Bar Button */}
      <div className="flex justify-end px-4">
        <Button onClick={handleSendToApproval}>
          Send To Approval for QA Lead {selectedRows.size > 0 && `(${selectedRows.size})`}
        </Button>
      </div>

      {/* Navigation Bar with Status Filter */}
      <SheetNavigationBar 
        activeStatus={activeWorkflowStatus}
        onStatusChange={onWorkflowStatusChange}
        statusCounts={statusCounts}
      />

      {/* Scrollable table container */}
      <div className="overflow-x-auto overflow-y-visible" style={{ maxWidth: '100%' }}>
        <table ref={tableRef} className="w-full border-collapse" style={{ minWidth: 'max-content' }}>
          <thead>
            <tr className="bg-gray-100">
              {columns.map(({ key, label, width }) => {
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
                message={`No ${activeWorkflowStatus.toLowerCase()} test cases found.`}
                onAdd={handleAddNew}
                buttonText="Add First Test Case"
                colSpan={19}
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
                    {/* Checkbox column */}
                    <td
                      data-column="checkbox"
                      style={{ width: `${getColumnWidth("checkbox", 30)}px` }}
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRows.has(testCase._id)}
                        onChange={(e) => handleCheckboxChange(testCase._id, e.target.checked)}
                        className="cursor-pointer"
                      />
                    </td>
                    {/* Workflow Status */}
                    <td
                      data-column="workflowStatus"
                      style={{ width: `${getColumnWidth("workflowStatus", 200)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <WorkflowStatusBadge status={testCase.workflowStatus} />
                    </td>
                    {/* TC ID */}
                    <td
                      data-column="tcId"
                      style={{ width: `${getColumnWidth("tcId", 80)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      TC_{String(testCase.sequenceNumber).padStart(3, '0')}
                    </td>
                    {/* Persona */}
                    <td
                      data-column="persona"
                      style={{ width: `${getColumnWidth("persona", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.persona}
                    </td>
                    {/* Module */}
                    <td
                      data-column="module"
                      style={{ width: `${getColumnWidth("module", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.module}
                    </td>
                    {/* Sub Module */}
                    <td
                      data-column="subModule"
                      style={{ width: `${getColumnWidth("subModule", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.subModule ?? "N/A"}
                    </td>
                    {/* Page Section */}
                    <td
                      data-column="pageSection"
                      style={{ width: `${getColumnWidth("pageSection", 180)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.pageSection}
                    </td>
                    {/* Wireframe Link */}
                    <td
                      data-column="wireframeLink"
                      style={{ width: `${getColumnWidth("wireframeLink", 180)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.wireframeLink ? (
                        <a
                          href={testCase.wireframeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    {/* Images/Icons */}
                    <td
                      data-column="imagesIcons"
                      style={{ width: `${getColumnWidth("imagesIcons", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.imagesIcons ? (
                        <img
                          src={testCase.imagesIcons}
                          alt="Test case visual"
                          className="h-8 w-8 object-cover rounded"
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    {/* Remarks */}
                    <td
                      data-column="remarks"
                      style={{ width: `${getColumnWidth("remarks", 200)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                    >
                      {testCase.remarks ?? "N/A"}
                    </td>
                    {/* Alt Text / Aria Label */}
                    <td
                      data-column="altTextAriaLabel"
                      style={{ width: `${getColumnWidth("altTextAriaLabel", 250)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                    >
                      {testCase.altTextAriaLabel}
                    </td>
                    {/* SE Implementation */}
                    <td
                      data-column="seImplementation"
                      style={{ width: `${getColumnWidth("seImplementation", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                     <SEImplementationBadge status={testCase.seImplementation} />
                    </td>
                    {/* Actual Results */}
                    <td
                      data-column="actualResults"
                      style={{ width: `${getColumnWidth("actualResults", 200)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                    >
                      {testCase.actualResults ?? "N/A"}
                    </td>
                    {/* Testing Status */}
                    <td
                      data-column="testingStatus"
                      style={{ width: `${getColumnWidth("testingStatus", 120)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      <TestingStatusBadge status={testCase.testingStatus} />
                    </td>
                    {/* Executed By */}
                    <td
                      data-column="executedBy"
                      style={{ width: `${getColumnWidth("executedBy", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.executedByName}
                    </td>
                    {/* Notes */}
                    <td
                      data-column="notes"
                      style={{ width: `${getColumnWidth("notes", 200)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                    >
                      {testCase.notes ?? "N/A"}
                    </td>
                    {/* Jira User Story */}
                    <td
                      data-column="jiraUserStory"
                      style={{ width: `${getColumnWidth("jiraUserStory", 180)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.jiraUserStory ?? "N/A"}
                    </td>
                    {/* Created By */}
                    <td
                      data-column="createdBy"
                      style={{ width: `${getColumnWidth("createdBy", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.createdByName}
                    </td>
                    {/* Created At */}
                    <td
                      data-column="createdAt"
                      style={{ width: `${getColumnWidth("createdAt", 130)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {new Date(testCase.createdAt).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: '2-digit'
                      })}
                    </td>
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
                    {/* TC ID - New */}
                    <td
                      data-column="tcId"
                      style={{ width: `${getColumnWidth("tcId", 80)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      TC_{String(testCases.length + 1).padStart(3, '0')}
                    </td>
                    {/* Persona - New */}
                    <td
                      data-column="persona"
                      style={{ width: `${getColumnWidth("persona", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        value={newTestCase.persona}
                        onChange={(e) => setNewTestCase({ ...newTestCase, persona: e.target.value as NewTestCase['persona'] })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        <option value="Employee">Employee</option>
                        <option value="Reporting Manager">Reporting Manager</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </td>
                    {/* Module - New */}
                    <td
                      data-column="module"
                      style={{ width: `${getColumnWidth("module", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="text"
                        value={newTestCase.module}
                        onChange={(e) => setNewTestCase({ ...newTestCase, module: e.target.value })}
                        placeholder="Module *"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* Sub Module - New */}
                    <td
                      data-column="subModule"
                      style={{ width: `${getColumnWidth("subModule", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="text"
                        value={newTestCase.subModule}
                        onChange={(e) => setNewTestCase({ ...newTestCase, subModule: e.target.value })}
                        placeholder="Sub Module"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* Page Section - New */}
                    <td
                      data-column="pageSection"
                      style={{ width: `${getColumnWidth("pageSection", 180)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="text"
                        value={newTestCase.pageSection}
                        onChange={(e) => setNewTestCase({ ...newTestCase, pageSection: e.target.value })}
                        placeholder="Page/Section *"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* Wireframe Link - New */}
                    <td
                      data-column="wireframeLink"
                      style={{ width: `${getColumnWidth("wireframeLink", 180)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="url"
                        value={newTestCase.wireframeLink}
                        onChange={(e) => setNewTestCase({ ...newTestCase, wireframeLink: e.target.value })}
                        placeholder="Wireframe Link"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* Images/Icons - New */}
                    <td
                      data-column="imagesIcons"
                      style={{ width: `${getColumnWidth("imagesIcons", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="url"
                        value={newTestCase.imagesIcons}
                        onChange={(e) => setNewTestCase({ ...newTestCase, imagesIcons: e.target.value })}
                        placeholder="Image URL"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* Remarks - New */}
                    <td
                      data-column="remarks"
                      style={{ width: `${getColumnWidth("remarks", 200)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <textarea
                        value={newTestCase.remarks}
                        onChange={(e) => setNewTestCase({ ...newTestCase, remarks: e.target.value })}
                        placeholder="Remarks"
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* Alt Text / Aria Label - New */}
                    <td
                      data-column="altTextAriaLabel"
                      style={{ width: `${getColumnWidth("altTextAriaLabel", 250)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <textarea
                        value={newTestCase.altTextAriaLabel}
                        onChange={(e) => setNewTestCase({ ...newTestCase, altTextAriaLabel: e.target.value })}
                        placeholder="Alt Text / Aria Label *"
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* SE Implementation - New */}
                    <td
                      data-column="seImplementation"
                      style={{ width: `${getColumnWidth("seImplementation", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        value={newTestCase.seImplementation}
                        onChange={(e) => setNewTestCase({ ...newTestCase, seImplementation: e.target.value as NewTestCase['seImplementation'] })}
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
                    {/* Actual Results - New */}
                    <td
                      data-column="actualResults"
                      style={{ width: `${getColumnWidth("actualResults", 200)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <textarea
                        value={newTestCase.actualResults}
                        onChange={(e) => setNewTestCase({ ...newTestCase, actualResults: e.target.value })}
                        placeholder="Actual Results"
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* Testing Status - New */}
                    <td
                      data-column="testingStatus"
                      style={{ width: `${getColumnWidth("testingStatus", 120)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        value={newTestCase.testingStatus}
                        onChange={(e) => setNewTestCase({ ...newTestCase, testingStatus: e.target.value as NewTestCase['testingStatus'] })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Not Run">Not Run</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </td>
                    {/* Executed By - New */}
                    <td
                      data-column="executedBy"
                      style={{ width: `${getColumnWidth("executedBy", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      N/A
                    </td>
                    {/* Notes - New */}
                    <td
                      data-column="notes"
                      style={{ width: `${getColumnWidth("notes", 200)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <textarea
                        value={newTestCase.notes}
                        onChange={(e) => setNewTestCase({ ...newTestCase, notes: e.target.value })}
                        placeholder="Notes"
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* Jira User Story - New */}
                    <td
                      data-column="jiraUserStory"
                      style={{ width: `${getColumnWidth("jiraUserStory", 180)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="text"
                        value={newTestCase.jiraUserStory}
                        onChange={(e) => setNewTestCase({ ...newTestCase, jiraUserStory: e.target.value })}
                        placeholder="Jira User Story"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {/* Created By - New */}
                    <td
                      data-column="createdBy"
                      style={{ width: `${getColumnWidth("createdBy", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      You
                    </td>
                    {/* Created At - New */}
                    <td
                      data-column="createdAt"
                      style={{ width: `${getColumnWidth("createdAt", 130)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      Now
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