// src/components/sheet/functionality/FunctionalityTestCasesTable.tsx

import React, { useState } from "react";
import { Doc, Id } from "convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { NumberedTextarea } from "../NumberedTextarea";
import { formatWithNumbering } from "../../../utils/formatUtils";
import { TestingStatusBadge } from "../common/StatusBadgeHelper";
import { WorkflowStatusBadge } from "../common/WorkflowStatusBadge";
import { ResizeHandle } from "../common/ResizeHandle";
import { BaseTable } from "../common/BaseTable";
import { calculateStatusCounts } from "../common/baseTableUtils";
import { 
  WorkflowStatus, 
  NewFunctionalityTestCase,
  TableColumn,
  BaseTestCase,
} from "@/types/testCaseTypes";

// Define the specific type for functionality test cases
type FunctionalityTestCase = Doc<"functionalityTestCases"> & BaseTestCase;

interface FunctionalityTestCasesTableProps {
  testCases: FunctionalityTestCase[];
  sheetId: string;
  activeWorkflowStatus: WorkflowStatus;
  onWorkflowStatusChange: (status: WorkflowStatus) => void;
  modules: Doc<"modules">[];
}

export function FunctionalityTestCasesTable({
  testCases,
  sheetId,
  activeWorkflowStatus,
  onWorkflowStatusChange,
  modules,
}: FunctionalityTestCasesTableProps) {
  const updateRowHeight = useMutation(
    api.myFunctions.updateFunctionalityTestCaseRowHeight,
  );
  const createTestCase = useMutation(
    api.myFunctions.createFunctionalityTestCase,
  );
  const batchUpdateWorkflowStatus = useMutation(
    api.myFunctions.batchUpdateFunctionalityWorkflowStatus,
  );

  // Fetch all test cases to get counts per status
  const allTestCasesData = useQuery(
    api.myFunctions.getTestCasesForSheet,
    sheetId ? { sheetId } : "skip"
  );

  // Safely extract all functionality test cases and calculate counts
  const allFunctionalityTestCases =
    (allTestCasesData &&
    'testCases' in allTestCasesData &&
    Array.isArray(allTestCasesData.testCases)
      ? allTestCasesData.testCases
      : []) as (Doc<"functionalityTestCases"> & { workflowStatus: WorkflowStatus })[];

  // Calculate status counts for the navigation bar
  const statusCounts = calculateStatusCounts(allFunctionalityTestCases);
  
  // Determine the next sequential ID for the new test case placeholder
  const totalTestCasesCount = allFunctionalityTestCases.length;

  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTestCase, setNewTestCase] = useState<NewFunctionalityTestCase>({
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
        module: newTestCase.module as Id<"modules">, 
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

  const columns: TableColumn[] = [
    { key: "checkbox", label: "", width: 30 },
    { key: "workflowStatus", label: "Workflow Status", width: 200 },
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

  const renderTestCaseRow = (
    testCase: FunctionalityTestCase,
    helpers: {
      handleCheckboxChange: (testCaseId: string, checked: boolean) => void;
      handleRowMouseDown: (e: React.MouseEvent, testCaseId: string, currentHeight: number) => void;
      selectedRows: Set<string>;
      getColumnWidth: (key: string, defaultWidth: number) => number;
      resizingRow: string | null;
    }
  ) => {
    const { handleCheckboxChange, handleRowMouseDown, selectedRows, getColumnWidth, resizingRow } = helpers;

    return (
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
          {testCase.moduleName}
        </td>
        {/* Sub Module */}
        <td
          data-column="subModule"
          style={{ width: `${getColumnWidth("subModule", 150)}px` }}
          className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          {testCase.subModule ?? "N/A"}
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
          {testCase.preConditions ?? "N/A"}
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
    );
  };

  const renderNewTestCaseRow = (helpers: {
    getColumnWidth: (key: string, defaultWidth: number) => number;
  }) => {
    const { getColumnWidth } = helpers;

    return (
      <tr className="bg-blue-50">
        {/* Checkbox - Empty for new row */}
        <td
          data-column="checkbox"
          style={{ width: `${getColumnWidth("checkbox", 30)}px` }}
          className="border border-gray-300 px-2 py-2 text-center"
        >
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
          TC_{String(totalTestCasesCount + 1).padStart(3, '0')}
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
            onChange={(e) => setNewTestCase({ ...newTestCase, scenario: e.target.value as "Happy Path" | "Unhappy Path" })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Happy Path">Happy Path</option>
            <option value="Unhappy Path">Unhappy Path</option>
          </select>
        </td>
        {/* Module - New */}
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
            onChange={(e) => setNewTestCase({ ...newTestCase, status: e.target.value as NewFunctionalityTestCase['status'] })}
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
    );
  };

  return (
    <BaseTable
      testCases={testCases}
      sheetId={sheetId}
      modules={modules}
      activeWorkflowStatus={activeWorkflowStatus}
      onWorkflowStatusChange={onWorkflowStatusChange}
      statusCounts={statusCounts}
      columns={columns}
      testCaseType="functionality"
      renderTestCaseRow={renderTestCaseRow}
      renderNewTestCaseRow={renderNewTestCaseRow}
      onSaveNew={handleSaveNew}
      onCancelNew={handleCancelNew}
      isAdding={isAdding}
      isSaving={isSaving}
      onAddNew={handleAddNew}
      batchUpdateMutation={batchUpdateWorkflowStatus}
      updateRowHeightMutation={updateRowHeight}
      emptyStateMessage={`No ${activeWorkflowStatus.toLowerCase()} test cases found.`}
      emptyStateButtonText="Add First Test Case"
    />
  );
}