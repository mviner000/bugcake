// src/components/sheet/alttextarialabel/AltTextAriaLabelTable.tsx
import React, { useState, useEffect } from "react";
import { Doc, Id } from "convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { TestingStatusBadge } from "../common/StatusBadgeHelper";
import { WorkflowStatusBadge } from "../common/WorkflowStatusBadge";
import { SEImplementationBadge } from "../common/SEImplementationBadge";
import { ResizeHandle } from "../common/ResizeHandle";
import { BaseTable } from "../common/BaseTable";
import { calculateStatusCounts } from "../common/baseTableUtils";
import { AddNewTestCaseForm } from "../common/AddNewTestCaseForm";
import { 
  WorkflowStatus, 
  NewAltTextAriaLabelTestCase,
  TableColumn,
} from "@/components/sheet/common/types/testCaseTypes";
import { CELL_BASE, CELL_CHECKBOX, CELL_WITH_WRAP, CELL_WORKFLOW } from "../styles/cellStyles";

// Define the specific type for alt text test cases
type AltTextTestCase = Doc<"altTextAriaLabelTestCases"> & {
  createdByName: string;
  executedByName: string;
  sequenceNumber: number;
  rowHeight?: number;
  createdAt: number;
  workflowStatus: WorkflowStatus;
  moduleName: string;
  module: Id<"modules">; // ✅ Required for alt text test cases
};

interface AltTextAriaLabelTableProps {
  testCases: AltTextTestCase[];
  sheetId: Id<"sheets">; 
  activeWorkflowStatus: WorkflowStatus;
  onWorkflowStatusChange: (status: WorkflowStatus) => void;
  modules: Doc<"modules">[];
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

  // Fetch all test cases to get counts per status
  const allTestCasesData = useQuery(
    api.myFunctions.getTestCasesForSheet,
    sheetId ? { sheetId } : "skip"
  );

  // Calculate status counts
  const statusCounts = allTestCasesData && 'testCases' in allTestCasesData 
    ? calculateStatusCounts(allTestCasesData.testCases as any[])
    : undefined;

  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preselectedModuleId, setPreselectedModuleId] = useState<string | null>(null); // ✅ NEW: Track preselected module
  const [newTestCase, setNewTestCase] = useState<NewAltTextAriaLabelTestCase>({
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

  // ✅ NEW: Move useEffect to component level
  useEffect(() => {
    if (preselectedModuleId && preselectedModuleId !== newTestCase.module) {
      setNewTestCase(prev => ({ ...prev, module: preselectedModuleId }));
    }
  }, [preselectedModuleId, newTestCase.module]);

  // ✅ UPDATED: Handle add with optional module preselection
  const handleAddNew = (moduleId?: string) => {
    setIsAdding(true);
    setPreselectedModuleId(moduleId || null); // ✅ Store preselected module ID
    setNewTestCase({
      persona: "User",
      module: moduleId || "", // Preselect module if provided
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
      setPreselectedModuleId(null); // ✅ Reset preselected module
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
    setPreselectedModuleId(null); // ✅ Reset preselected module
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

  const columns: TableColumn[] = [
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

  const renderTestCaseRow = (
    testCase: AltTextTestCase,
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
        <td
          data-column="workflowStatus"
          style={{ width: `${getColumnWidth("workflowStatus", 200)}px` }}
          className={CELL_WORKFLOW}
        >
          <WorkflowStatusBadge status={testCase.workflowStatus} />
        </td>
        <td
          data-column="tcId"
          style={{ width: `${getColumnWidth("tcId", 80)}px` }}
          className={CELL_BASE}
        >
          TC_{String(testCase.sequenceNumber).padStart(3, '0')}
        </td>
        <td
          data-column="persona"
          style={{ width: `${getColumnWidth("persona", 150)}px` }}
          className={CELL_BASE}
        >
          {testCase.persona}
        </td>
        <td
          data-column="module"
          style={{ width: `${getColumnWidth("module", 150)}px` }}
          className={CELL_BASE}
        >
          {testCase.moduleName}
        </td>
        <td
          data-column="subModule"
          style={{ width: `${getColumnWidth("subModule", 150)}px` }}
          className={CELL_BASE}
        >
          {testCase.subModule ?? "N/A"}
        </td>
        <td
          data-column="pageSection"
          style={{ width: `${getColumnWidth("pageSection", 180)}px` }}
          className={CELL_BASE}
        >
          {testCase.pageSection}
        </td>
        <td
          data-column="wireframeLink"
          style={{ width: `${getColumnWidth("wireframeLink", 180)}px` }}
          className={CELL_BASE}
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
          className={CELL_BASE}
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
          className={CELL_WITH_WRAP}
        >
          {testCase.remarks ?? "N/A"}
        </td>
        <td
          data-column="altTextAriaLabel"
          style={{ width: `${getColumnWidth("altTextAriaLabel", 250)}px` }}
          className={CELL_WITH_WRAP}
        >
          {testCase.altTextAriaLabel}
        </td>
        <td
          data-column="seImplementation"
          style={{ width: `${getColumnWidth("seImplementation", 150)}px` }}
          className={CELL_BASE}
        >
          <SEImplementationBadge status={testCase.seImplementation} />
        </td>
        <td
          data-column="actualResults"
          style={{ width: `${getColumnWidth("actualResults", 200)}px` }}
          className={CELL_WITH_WRAP}
        >
          {testCase.actualResults ?? "N/A"}
        </td>
        <td
          data-column="testingStatus"
          style={{ width: `${getColumnWidth("testingStatus", 120)}px` }}
          className={CELL_BASE}
        >
          <TestingStatusBadge status={testCase.testingStatus} />
        </td>
        <td
          data-column="executedBy"
          style={{ width: `${getColumnWidth("executedBy", 150)}px` }}
          className={CELL_BASE}
        >
          {testCase.executedByName}
        </td>
        <td
          data-column="notes"
          style={{ width: `${getColumnWidth("notes", 200)}px` }}
          className={CELL_WITH_WRAP}
        >
          {testCase.notes ?? "N/A"}
        </td>
        <td
          data-column="jiraUserStory"
          style={{ width: `${getColumnWidth("jiraUserStory", 180)}px` }}
          className={CELL_BASE}
        >
          {testCase.jiraUserStory ?? "N/A"}
        </td>
        <td
          data-column="createdBy"
          style={{ width: `${getColumnWidth("createdBy", 150)}px` }}
          className={CELL_BASE}
        >
          {testCase.createdByName}
        </td>
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

  // ✅ FIXED: No hooks inside this function anymore
  const renderNewTestCaseRow = (helpers: {
    getColumnWidth: (key: string, defaultWidth: number) => number;
    preselectedModuleId?: string;
  }) => {
    const { getColumnWidth } = helpers;
    // Note: preselectedModuleId is already handled by the useEffect at component level

    // Define form fields for the AddNewTestCaseForm component
    const formFields = [
      {
        key: 'persona',
        type: 'select' as const,
        value: newTestCase.persona,
        options: [
          { value: 'Super Admin', label: 'Super Admin' },
          { value: 'Admin', label: 'Admin' },
          { value: 'User', label: 'User' },
          { value: 'Employee', label: 'Employee' },
          { value: 'Reporting Manager', label: 'Reporting Manager' },
          { value: 'Manager', label: 'Manager' },
        ],
      },
      {
        key: 'module',
        type: 'select' as const,
        value: newTestCase.module,
        required: true,
        disabled: !!preselectedModuleId, // ✅ Disable if preselected
      },
      {
        key: 'subModule',
        type: 'text' as const,
        value: newTestCase.subModule,
        placeholder: 'Sub Module',
      },
      {
        key: 'pageSection',
        type: 'text' as const,
        value: newTestCase.pageSection,
        placeholder: 'Page/Section *',
        required: true,
      },
      {
        key: 'wireframeLink',
        type: 'url' as const,
        value: newTestCase.wireframeLink,
        placeholder: 'Wireframe Link',
      },
      {
        key: 'imagesIcons',
        type: 'url' as const,
        value: newTestCase.imagesIcons,
        placeholder: 'Image URL',
      },
      {
        key: 'remarks',
        type: 'textarea' as const,
        value: newTestCase.remarks,
        placeholder: 'Remarks',
        rows: 2,
      },
      {
        key: 'altTextAriaLabel',
        type: 'textarea' as const,
        value: newTestCase.altTextAriaLabel,
        placeholder: 'Alt Text / Aria Label *',
        rows: 2,
        required: true,
      },
      {
        key: 'seImplementation',
        type: 'select' as const,
        value: newTestCase.seImplementation,
        options: [
          { value: 'Not yet', label: 'Not yet' },
          { value: 'Ongoing', label: 'Ongoing' },
          { value: 'Done', label: 'Done' },
          { value: 'Has Concerns', label: 'Has Concerns' },
          { value: 'To Update', label: 'To Update' },
          { value: 'Outdated', label: 'Outdated' },
          { value: 'Not Available', label: 'Not Available' },
        ],
      },
      {
        key: 'actualResults',
        type: 'textarea' as const,
        value: newTestCase.actualResults,
        placeholder: 'Actual Results',
        rows: 2,
      },
      {
        key: 'testingStatus',
        type: 'select' as const,
        value: newTestCase.testingStatus,
        options: [
          { value: 'Passed', label: 'Passed' },
          { value: 'Failed', label: 'Failed' },
          { value: 'Not Run', label: 'Not Run' },
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
        key: 'notes',
        type: 'textarea' as const,
        value: newTestCase.notes,
        placeholder: 'Notes',
        rows: 2,
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
        nextSequenceNumber={testCases.length + 1}
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
      testCaseType="altTextAriaLabel"
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