// src/components/sheet/FunctionalityTestCasesTable.tsx

import { Doc } from "convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState, useRef } from "react";
import { NumberedTextarea } from "./NumberedTextarea";
import { useColumnResize } from "../../hooks/useColumnResize";
import { useRowResize } from "../../hooks/useRowResize";
import { useColumnWidths } from "../../hooks/useColumnWidths";
import { TableHeaderCell } from "./common/TableHeaderCell";
import { ResizeHandle } from "./common/ResizeHandle";
import { TableActionButtons } from "./common/TableActionButtons";
import { EmptyTableState } from "./common/EmptyTableState";
import { ResizeFeedback } from "./common/ResizeFeedback";
import { ActivityHistorySheet } from "./ActivityHistorySheet";
import { formatWithNumbering } from "../../utils/formatUtils";
import { TestingStatusBadge } from "./common/statusBadgeHelper";

interface FunctionalityTestCasesTableProps {
  testCases: (Doc<"functionalityTestCases"> & {
    createdByName: string;
    executedByName: string;
    sequenceNumber: number;
    rowHeight?: number;
    createdAt: number;
  })[];
  sheetId: string;
}

interface NewTestCase {
  title: string;
  level: "High" | "Low";
  scenario: "Happy Path" | "Unhappy Path";
  module: string;
  subModule: string;
  preConditions: string;
  steps: string;
  expectedResults: string;
  status: "Passed" | "Failed" | "Not Run" | "Blocked" | "Not Available";
  jiraUserStory: string;
}

export function FunctionalityTestCasesTable({
  testCases,
  sheetId,
}: FunctionalityTestCasesTableProps) {
  const updateRowHeight = useMutation(
    api.myFunctions.updateFunctionalityTestCaseRowHeight,
  );
  const createTestCase = useMutation(
    api.myFunctions.createFunctionalityTestCase,
  );
  const fetchedColumnWidths = useQuery(api.myFunctions.getColumnWidths, {
    sheetId,
    testCaseType: "functionality",
  });
  const updateColumnWidth = useMutation(api.myFunctions.updateColumnWidth);

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
        testCaseType: "functionality"
      });
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTestCase, setNewTestCase] = useState<NewTestCase>({
    title: "",
    level: "High",
    scenario: "Happy Path",
    module: "",
    subModule: "",
    preConditions: "",
    steps: "",
    expectedResults: "",
    status: "Not Run",
    jiraUserStory: "",
  });
  const tableRef = useRef<HTMLTableElement>(null);

  const handleAddNew = () => {
    setIsAdding(true);
    setNewTestCase({
      title: "",
      level: "High",
      scenario: "Happy Path",
      module: "",
      subModule: "",
      preConditions: "",
      steps: "",
      expectedResults: "",
      status: "Not Run",
      jiraUserStory: "",
    });
  };

  const handleSaveNew = async () => {
    if (!newTestCase.title.trim() || !newTestCase.steps.trim() || !newTestCase.expectedResults.trim()) {
      alert("Title, Steps, and Expected Results are required fields.");
      return;
    }

    setIsSaving(true);
    try {
      await createTestCase({
        sheetId,
        title: newTestCase.title.trim(),
        level: newTestCase.level,
        scenario: newTestCase.scenario,
        module: newTestCase.module ? newTestCase.module.trim() : undefined,
        subModule: newTestCase.subModule ? newTestCase.subModule.trim() : undefined,
        preConditions: newTestCase.preConditions ? formatWithNumbering(newTestCase.preConditions) : undefined,
        steps: formatWithNumbering(newTestCase.steps),
        expectedResults: formatWithNumbering(newTestCase.expectedResults),
        status: newTestCase.status,
        jiraUserStory: newTestCase.jiraUserStory ? newTestCase.jiraUserStory.trim() : undefined,
      });
      setIsAdding(false);
      setNewTestCase({
        title: "",
        level: "High",
        scenario: "Happy Path",
        module: "",
        subModule: "",
        preConditions: "",
        steps: "",
        expectedResults: "",
        status: "Not Run",
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
      title: "",
      level: "High",
      scenario: "Happy Path",
      module: "",
      subModule: "",
      preConditions: "",
      steps: "",
      expectedResults: "",
      status: "Not Run",
      jiraUserStory: "",
    });
  };

  const columns = [
    { key: "tcId", label: "TC ID", width: 80 },
    { key: "level", label: "TC Level", width: 100 },
    { key: "scenario", label: "Scenarios", width: 120 },
    { key: "module", label: "Module", width: 150 },
    { key: "subModule", label: "Sub Module", width: 150 },
    { key: "title", label: "Test Case Title", width: 200 },
    { key: "preConditions", label: "Pre Conditions", width: 180 },
    { key: "steps", label: "Test Steps", width: 250 },
    { key: "expectedResults", label: "Expected Results", width: 250 },
    { key: "status", label: "Testing Status", width: 120 },
    { key: "executedBy", label: "Executed By:", width: 150 },
    { key: "jiraUserStory", label: "Jira Associated User Stories", width: 180 },
    { key: "createdBy", label: "Created By:", width: 150 },
    { key: "createdAt", label: "Date of Creation", width: 130 },
  ];

  return (
    <div className="flex flex-col">
      {/* Top Bar with Activity Button */}
      <div className="flex justify-end mb-4 px-4">
        <ActivityHistorySheet sheetId={sheetId as any} /> 
      </div>

      {/* Scrollable table container */}
      <div className="overflow-x-auto overflow-y-visible" style={{ maxWidth: '100%' }}>
        <table ref={tableRef} className="w-full border-collapse" style={{ minWidth: 'max-content' }}>
          <thead>
            <tr className="bg-gray-100">
              {columns.map(({ key, label, width }) => (
                <TableHeaderCell
                  key={key}
                  columnKey={key}
                  label={label}
                  width={getColumnWidth(key, width)}
                  isResizing={resizingColumn === key}
                  onResizeStart={handleColumnMouseDown}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {testCases.length === 0 && !isAdding ?
              (
                <EmptyTableState
                  message="No functionality test cases found."
                  onAdd={handleAddNew}
                  buttonText="Add First Test Case"
                  colSpan={14}
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
                      {/* TC ID */}
                      <td
                        data-column="tcId"
                        style={{ width: `${getColumnWidth("tcId", 80)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        TC_{String(testCase.sequenceNumber).padStart(3, '0')}
                      </td>
                      {/* TC Level */}
                      <td
                        data-column="level"
                        style={{ width: `${getColumnWidth("level", 100)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        {testCase.level}
                      </td>
                      {/* Scenario */}
                      <td
                        data-column="scenario"
                        style={{ width: `${getColumnWidth("scenario", 120)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        {testCase.scenario}
                      </td>
                      {/* Module */}
                      <td
                        data-column="module"
                        style={{ width: `${getColumnWidth("module", 150)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        {testCase.module ??
                          "N/A"}
                      </td>
                      {/* Sub Module */}
                      <td
                        data-column="subModule"
                        style={{ width: `${getColumnWidth("subModule", 150)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        {testCase.subModule ??
                          "N/A"}
                      </td>
                      {/* Title */}
                      <td
                        data-column="title"
                        style={{ width: `${getColumnWidth("title", 200)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        {testCase.title}
                      </td>
                      {/* Pre Conditions */}
                      <td
                        data-column="preConditions"
                        style={{ width: `${getColumnWidth("preConditions", 180)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                      >
                        {testCase.preConditions ??
                          "N/A"}
                      </td>
                      {/* Steps */}
                      <td
                        data-column="steps"
                        style={{ width: `${getColumnWidth("steps", 250)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                      >
                        {testCase.steps}
                      </td>
                      {/* Expected Results */}
                      <td
                        data-column="expectedResults"
                        style={{ width: `${getColumnWidth("expectedResults", 250)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                      >
                        {testCase.expectedResults}
                      </td>
                      {/* Status */}
                      <td
                        data-column="status"
                        style={{ width: `${getColumnWidth("status", 120)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        <TestingStatusBadge status={testCase.status} />
                      </td>
                      {/* Executed By */}
                      <td
                        data-column="executedBy"
                        style={{ width: `${getColumnWidth("executedBy", 150)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        {testCase.executedByName}
                      </td>
                      {/* Jira User Story */}
                      <td
                        data-column="jiraUserStory"
                        style={{ width: `${getColumnWidth("jiraUserStory", 180)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      >
                        {testCase.jiraUserStory}
                      </td>
                      {/* Created By */}
                      <td
                        data-column="createdBy"
                        style={{ width: `${getColumnWidth("createdBy", 150)}px` }}
                        className="border border-gray-300 px-3
                      py-2 text-sm text-gray-900"
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
                        onMouseDown={(e) => handleRowMouseDown(e, testCase._id, testCase.rowHeight ||
                          20)}
                      />
                    </tr>
                  ))}

                  {/* New Row Input */}
                  {isAdding && (
                    <tr className="bg-blue-50">
                      {/* TC ID - New */}
                      <td
                        data-column="tcId"
                        style={{ width: `${getColumnWidth("tcId", 80)}px` }}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                      >
                        TC_{String(testCases.length + 1).padStart(3, '0')}
                      </td>
                      {/* TC Level - New */}
                      <td
                        data-column="level"
                        style={{ width: `${getColumnWidth("level", 100)}px` }}
                        className="border border-gray-300 px-3 py-2"
                      >
                        <select
                          value={newTestCase.level}
                          onChange={(e) => setNewTestCase({ ...newTestCase, level: e.target.value as "High" | "Low" })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="High">High</option>
                          <option value="Low">Low</option>
                        </select>
                      </td>
                      {/* Scenario - New */}
                      <td
                        data-column="scenario"
                        style={{ width: `${getColumnWidth("scenario", 120)}px` }}
                        className="border border-gray-300 px-3 py-2"
                      >
                        <select
                          value={newTestCase.scenario}
                          onChange={(e) => setNewTestCase({ ...newTestCase, scenario: e.target.value as "Happy Path" |
                            "Unhappy Path" })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Happy Path">Happy Path</option>
                          <option value="Unhappy Path">Unhappy Path</option>
                        </select>
                      </td>
                      {/* Module - New */}
                      <td
                        data-column="module"
                        style={{ width: `${getColumnWidth("module", 150)}px` }} className="border border-gray-300 px-3 py-2"
                      >
                        <input
                          type="text"
                          value={newTestCase.module}
                          onChange={(e) => setNewTestCase({ ...newTestCase, module: e.target.value })}
                          placeholder="Module"
                          maxLength={50}
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
                      {/* Title - New */}
                      <td
                        data-column="title"
                        style={{ width: `${getColumnWidth("title", 200)}px` }}
                        className="border border-gray-300 px-3 py-2"
                      >
                        <input
                          type="text"
                          value={newTestCase.title}
                          onChange={(e) => setNewTestCase({ ...newTestCase, title: e.target.value })}
                          placeholder="Title *"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {/* Pre Conditions - New */}
                      <td
                        data-column="preConditions"
                        style={{ width: `${getColumnWidth("preConditions", 180)}px` }}
                        className="border border-gray-300 px-3 py-2"
                      >
                        <NumberedTextarea
                          value={newTestCase.preConditions}
                          onChange={(value) => setNewTestCase({ ...newTestCase, preConditions: value })}
                          placeholder="Pre Conditions"
                          rows={3}
                          className="text-sm"
                        />
                      </td>
                      {/* Steps - New */}
                      <td
                        data-column="steps"
                        style={{ width: `${getColumnWidth("steps", 250)}px` }}
                        className="border border-gray-300 px-3 py-2"
                      >
                        <NumberedTextarea
                          value={newTestCase.steps}
                          onChange={(value) => setNewTestCase({ ...newTestCase, steps: value })}
                          placeholder="Test Steps *"
                          rows={3}
                          className="text-sm"
                        />
                      </td>
                      {/* Expected Results - New */}
                      <td
                        data-column="expectedResults"
                        style={{ width: `${getColumnWidth("expectedResults", 250)}px` }}
                        className="border border-gray-300 px-3 py-2"
                      >
                        <NumberedTextarea
                          value={newTestCase.expectedResults}
                          onChange={(value) => setNewTestCase({ ...newTestCase, expectedResults: value })}
                          placeholder="Expected Results *"
                          rows={3}
                          className="text-sm"
                        />
                      </td>
                      {/* Status - New */}
                      <td
                        data-column="status"
                        style={{ width: `${getColumnWidth("status", 120)}px` }}
                        className="border border-gray-300 px-3 py-2"
                      >
                        <select
                          value={newTestCase.status}
                          onChange={(e) => setNewTestCase({ ...newTestCase, status: e.target.value as NewTestCase['status'] })}
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

      {/* Add New Row Button - FIXED: Now shows when adding OR when testCases exist */}
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