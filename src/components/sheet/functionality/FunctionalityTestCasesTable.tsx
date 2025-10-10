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
import { AddNewTestCaseForm } from "../common/AddNewTestCaseForm";
import { 
  WorkflowStatus, 
  NewFunctionalityTestCase,
  TableColumn,
  BaseTestCase,
} from "@/components/sheet/common/types/testCaseTypes";
import { CELL_BASE, CELL_CHECKBOX, CELL_WITH_WRAP } from "../styles/cellStyles";


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
          className={CELL_CHECKBOX}
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
          className={CELL_BASE}
        >
          <WorkflowStatusBadge status={testCase.workflowStatus} />
        </td>
        {/* TC ID */}
        <td
          data-column="tcId"
          style={{ width: `${getColumnWidth("tcId", 80)}px` }}
          className={CELL_BASE}
        >
          TC_{String(testCase.sequenceNumber).padStart(3, '0')}
        </td>
        {/* TC Level */}
        <td
          data-column="level"
          style={{ width: `${getColumnWidth("level", 100)}px` }}
          className={CELL_BASE}
        >
          {testCase.level}
        </td>
        {/* Scenario */}
        <td
          data-column="scenario"
          style={{ width: `${getColumnWidth("scenario", 120)}px` }}
          className={CELL_BASE}
        >
          {testCase.scenario}
        </td>
        {/* Module */}
        <td
          data-column="module"
          style={{ width: `${getColumnWidth("module", 150)}px` }}
          className={CELL_BASE}
        >
          {testCase.moduleName}
        </td>
        {/* Sub Module */}
        <td
          data-column="subModule"
          style={{ width: `${getColumnWidth("subModule", 150)}px` }}
          className={CELL_BASE}
        >
          {testCase.subModule ?? "N/A"}
        </td>
        {/* Title */}
        <td
          data-column="title"
          style={{ width: `${getColumnWidth("title", 200)}px` }}
          className={CELL_BASE}
        >
          {testCase.title}
        </td>
        {/* Pre Conditions */}
        <td
          data-column="preConditions"
          style={{ width: `${getColumnWidth("preConditions", 180)}px` }}
          className={CELL_WITH_WRAP}
        >
          {testCase.preConditions ?? "N/A"}
        </td>
        {/* Steps */}
        <td
          data-column="steps"
          style={{ width: `${getColumnWidth("steps", 250)}px` }}
          className={CELL_WITH_WRAP}
        >
          {testCase.steps}
        </td>
        {/* Expected Results */}
        <td
          data-column="expectedResults"
          style={{ width: `${getColumnWidth("expectedResults", 250)}px` }}
          className={CELL_WITH_WRAP}
        >
          {testCase.expectedResults}
        </td>
        {/* Status */}
        <td
          data-column="status"
          style={{ width: `${getColumnWidth("status", 120)}px` }}
          className={CELL_BASE}
        >
          <TestingStatusBadge status={testCase.status} />
        </td>
        {/* Executed By */}
        <td
          data-column="executedBy"
          style={{ width: `${getColumnWidth("executedBy", 150)}px` }}
          className={CELL_BASE}
        >
          {testCase.executedByName}
        </td>
        {/* Jira User Story */}
        <td
          data-column="jiraUserStory"
          style={{ width: `${getColumnWidth("jiraUserStory", 180)}px` }}
          className={CELL_BASE}
        >
          {testCase.jiraUserStory}
        </td>
        {/* Created By */}
        <td
          data-column="createdBy"
          style={{ width: `${getColumnWidth("createdBy", 150)}px` }}
          className={CELL_BASE}
        >
          {testCase.createdByName}
        </td>
        {/* Created At */}
        <td
          data-column="createdAt"
          style={{ width: `${getColumnWidth("createdAt", 130)}px` }}
          className={CELL_BASE}
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

    // Define form fields for the AddNewTestCaseForm component
    const formFields = [
      {
        key: 'level',
        type: 'select' as const,
        value: newTestCase.level,
        options: [
          { value: 'High', label: 'High' },
          { value: 'Low', label: 'Low' },
        ],
      },
      {
        key: 'scenario',
        type: 'select' as const,
        value: newTestCase.scenario,
        options: [
          { value: 'Happy Path', label: 'Happy Path' },
          { value: 'Unhappy Path', label: 'Unhappy Path' },
        ],
      },
      {
        key: 'module',
        type: 'select' as const,
        value: newTestCase.module,
        required: true,
      },
      {
        key: 'subModule',
        type: 'text' as const,
        value: newTestCase.subModule,
        placeholder: 'Sub Module',
      },
      {
        key: 'title',
        type: 'text' as const,
        value: newTestCase.title,
        placeholder: 'Title *',
        required: true,
      },
      {
        key: 'preConditions',
        type: 'numberedTextarea' as const,
        value: newTestCase.preConditions,
        placeholder: 'Pre Conditions',
        rows: 3,
      },
      {
        key: 'steps',
        type: 'numberedTextarea' as const,
        value: newTestCase.steps,
        placeholder: 'Test Steps *',
        rows: 3,
        required: true,
      },
      {
        key: 'expectedResults',
        type: 'numberedTextarea' as const,
        value: newTestCase.expectedResults,
        placeholder: 'Expected Results *',
        rows: 3,
        required: true,
      },
      {
        key: 'status',
        type: 'select' as const,
        value: newTestCase.status,
        options: [
          { value: 'Not Run', label: 'Not Run' },
          { value: 'Passed', label: 'Passed' },
          { value: 'Failed', label: 'Failed' },
          { value: 'Blocked', label: 'Blocked' },
          { value: 'Not Available', label: 'Not Available' },
        ],
      },
      {
        key: 'executedBy',
        type: 'readonly' as const,
        value: 'N/A',
      },
      {
        key: 'jiraUserStory',
        type: 'text' as const,
        value: newTestCase.jiraUserStory,
        placeholder: 'Jira User Story',
      },
      {
        key: 'createdBy',
        type: 'readonly' as const,
        value: 'You',
      },
      {
        key: 'createdAt',
        type: 'readonly' as const,
        value: 'Now',
      },
    ];

    const handleFieldChange = (key: string, value: string) => {
      setNewTestCase({ ...newTestCase, [key]: value });
    };

    return (
      <AddNewTestCaseForm
        columns={columns}
        formFields={formFields}
        onFieldChange={handleFieldChange}
        getColumnWidth={getColumnWidth}
        modules={modules}
        nextSequenceNumber={totalTestCasesCount + 1}
        NumberedTextareaComponent={NumberedTextarea}
      />
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