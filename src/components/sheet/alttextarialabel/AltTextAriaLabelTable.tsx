// src/components/sheet/alttextarialabel/AltTextAriaLabelTable.tsx
import React, { useState, useRef, useMemo } from "react";
import { Doc, Id } from "convex/_generated/dataModel";
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
import { ModuleNamebar } from "../common/ModuleNamebar";

interface AltTextAriaLabelTableProps {
  testCases: (Doc<"altTextAriaLabelTestCases"> & {
    createdByName: string;
    executedByName: string;
    sequenceNumber: number;
    rowHeight?: number;
    createdAt: number;
    workflowStatus: WorkflowStatus;
    moduleName: string;
    module: Id<"modules">;
  })[];
  sheetId: string;
  activeWorkflowStatus: WorkflowStatus;
  onWorkflowStatusChange: (status: WorkflowStatus) => void;
  modules: Doc<"modules">[];
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

export function AltTextAriaLabelTable({
  testCases,
  sheetId,
  activeWorkflowStatus,
  onWorkflowStatusChange,
  modules,
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

  // Group test cases by module
  const groupedTestCases = useMemo(() => {
    const groups: Record<string, typeof testCases> = {};
    
    testCases.forEach(testCase => {
      const moduleKey = testCase.module || 'ungrouped';
      if (!groups[moduleKey]) {
        groups[moduleKey] = [];
      }
      groups[moduleKey].push(testCase);
    });
    
    return groups;
  }, [testCases]);

  // Get module colors (cycling through a palette)
  const getModuleColor = (index: number) => {
    const colors = [
      { bg: "bg-blue-600", text: "text-white" },
      { bg: "bg-green-600", text: "text-white" },
      { bg: "bg-purple-600", text: "text-white" },
      { bg: "bg-orange-600", text: "text-white" },
      { bg: "bg-teal-600", text: "text-white" },
      { bg: "bg-pink-600", text: "text-white" },
      { bg: "bg-indigo-600", text: "text-white" },
    ];
    return colors[index % colors.length];
  };

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
    if (!newTestCase.module || !newTestCase.pageSection.trim() || !newTestCase.altTextAriaLabel.trim()) {
      alert("Module, Page Section, and Alt Text/Aria Label are required fields.");
      return;
    }

    setIsSaving(true);
    try {
      await createTestCase({
        sheetId,
        persona: newTestCase.persona,
        module: newTestCase.module as Id<"modules">, 
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

  const renderTestCaseRow = (testCase: typeof testCases[0]) => (
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
      <td
        data-column="workflowStatus"
        style={{ width: `${getColumnWidth("workflowStatus", 200)}px` }}
        className="border border-gray-300 px-3 py-2"
      >
        <WorkflowStatusBadge status={testCase.workflowStatus} />
      </td>
      <td
        data-column="tcId"
        style={{ width: `${getColumnWidth("tcId", 80)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        TC_{String(testCase.sequenceNumber).padStart(3, '0')}
      </td>
      <td
        data-column="persona"
        style={{ width: `${getColumnWidth("persona", 150)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        {testCase.persona}
      </td>
      <td
        data-column="module"
        style={{ width: `${getColumnWidth("module", 150)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        {testCase.moduleName}
      </td>
      <td
        data-column="subModule"
        style={{ width: `${getColumnWidth("subModule", 150)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        {testCase.subModule ?? "N/A"}
      </td>
      <td
        data-column="pageSection"
        style={{ width: `${getColumnWidth("pageSection", 180)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        {testCase.pageSection}
      </td>
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
      <td
        data-column="remarks"
        style={{ width: `${getColumnWidth("remarks", 200)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
      >
        {testCase.remarks ?? "N/A"}
      </td>
      <td
        data-column="altTextAriaLabel"
        style={{ width: `${getColumnWidth("altTextAriaLabel", 250)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
      >
        {testCase.altTextAriaLabel}
      </td>
      <td
        data-column="seImplementation"
        style={{ width: `${getColumnWidth("seImplementation", 150)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        <SEImplementationBadge status={testCase.seImplementation} />
      </td>
      <td
        data-column="actualResults"
        style={{ width: `${getColumnWidth("actualResults", 200)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
      >
        {testCase.actualResults ?? "N/A"}
      </td>
      <td
        data-column="testingStatus"
        style={{ width: `${getColumnWidth("testingStatus", 120)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        <TestingStatusBadge status={testCase.testingStatus} />
      </td>
      <td
        data-column="executedBy"
        style={{ width: `${getColumnWidth("executedBy", 150)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        {testCase.executedByName}
      </td>
      <td
        data-column="notes"
        style={{ width: `${getColumnWidth("notes", 200)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
      >
        {testCase.notes ?? "N/A"}
      </td>
      <td
        data-column="jiraUserStory"
        style={{ width: `${getColumnWidth("jiraUserStory", 180)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        {testCase.jiraUserStory ?? "N/A"}
      </td>
      <td
        data-column="createdBy"
        style={{ width: `${getColumnWidth("createdBy", 150)}px` }}
        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
      >
        {testCase.createdByName}
      </td>
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
  );

  return (
    <div className="flex flex-col">
      {/* Top Bar Button */}
      <div className="flex justify-start px-4">
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
                {Object.entries(groupedTestCases).map(([moduleId, moduleTestCases], groupIndex) => {
                  const moduleName = moduleTestCases[0]?.moduleName || 'Unknown Module';
                  const color = getModuleColor(groupIndex);
                  
                  return (
                    <React.Fragment key={moduleId}>
                      {/* Module Name Bar */}
                      <tr>
                        <td colSpan={19} className="p-0">
                          <ModuleNamebar 
                            title={`${moduleName} (${moduleTestCases.length} test cases)`}
                            bgColor={color.bg}
                            textColor={color.text}
                          />
                        </td>
                      </tr>
                      {/* Test Cases for this module */}
                      {moduleTestCases.map(testCase => renderTestCaseRow(testCase))}
                    </React.Fragment>
                  );
                })}

                {/* New Row Input */}
                {isAdding && (
                  <tr className="bg-blue-50">
                    <td
                      data-column="checkbox"
                      style={{ width: `${getColumnWidth("checkbox", 30)}px` }}
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                    </td>
                    <td
                      data-column="workflowStatus"
                      style={{ width: `${getColumnWidth("workflowStatus", 200)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <WorkflowStatusBadge status="Open" />
                    </td>
                    <td
                      data-column="tcId"
                      style={{ width: `${getColumnWidth("tcId", 80)}px` }}
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
                    <td
                      data-column="module"
                      style={{ width: `${getColumnWidth("module", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        value={newTestCase.module}
                        onChange={(e) => setNewTestCase({ ...newTestCase, module: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Module</option>
                        {modules.map(module => (
                          <option key={module._id} value={module._id}>
                            {module.name}
                          </option>
                        ))}
                      </select>
                    </td>
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
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                        <option value="Not Run">Not Run</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </td>
                    <td
                      data-column="executedBy"
                      style={{ width: `${getColumnWidth("executedBy", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      N/A
                    </td>
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
                    <td
                      data-column="createdBy"
                      style={{ width: `${getColumnWidth("createdBy", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      Current User
                    </td>
                    <td
                      data-column="createdAt"
                      style={{ width: `${getColumnWidth("createdAt", 130)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      Today
                    </td>
                    <td colSpan={1}></td>
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