// src/components/sheet/FunctionalityTestCasesTable.tsx

import { Doc } from "convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useState, useRef, useCallback } from "react";
import { Plus, Check, X } from "lucide-react";
import { NumberedTextarea } from "./NumberedTextarea";

interface FunctionalityTestCasesTableProps {
  testCases: (Doc<"functionalityTestCases"> & {
    createdByName: string;
    executedByName: string;
    sequenceNumber: number;
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
  const columnWidths = useQuery(api.myFunctions.getColumnWidths, {
    sheetId,
    testCaseType: "functionality",
  });
  const updateColumnWidth = useMutation(api.myFunctions.updateColumnWidth);
  
  const [resizing, setResizing] = useState<string | null>(null);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
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

  // Helper to get column width
  const getColumnWidth = (columnName: string, defaultWidth: number) => {
    const saved = columnWidths?.find((cw) => cw.columnName === columnName);
    return saved ? saved.width : defaultWidth;
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, testCaseId: string, currentHeight: number) => {
      e.preventDefault();
      setResizing(testCaseId);
      setStartY(e.clientY);
      setStartHeight(currentHeight);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing) return;

      const deltaY = e.clientY - startY;
      const newHeight = Math.max(20, Math.min(500, startHeight + deltaY));

      const row = document.querySelector(
        `tr[data-testcase-id="${resizing}"]`,
      ) as HTMLElement;
      if (row) {
        row.style.height = `${newHeight}px`;
      }
    },
    [resizing, startY, startHeight],
  );

  const handleMouseUp = useCallback(() => {
    if (!resizing) return;

    const row = document.querySelector(
      `tr[data-testcase-id="${resizing}"]`,
    ) as HTMLElement;
    const finalHeight = row ? parseInt(row.style.height) || 20 : 20;

    updateRowHeight({
      testCaseId: resizing,
      rowHeight: finalHeight,
    }).catch((error) => {
      console.error("Failed to update row height:", error);
      if (row) {
        const originalTestCase = testCases.find((tc) => tc._id === resizing);
        row.style.height = `${originalTestCase?.rowHeight || 20}px`;
      }
    });

    setResizing(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [resizing, updateRowHeight, testCases]);

  // Column resize handlers
  const handleColumnMouseDown = useCallback(
    (e: React.MouseEvent, columnName: string, currentWidth: number) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingColumn(columnName);
      setStartX(e.clientX);
      setStartWidth(currentWidth);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [],
  );

  const handleColumnMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingColumn) return;

      const deltaX = e.clientX - startX;
      const newWidth = Math.max(50, Math.min(1000, startWidth + deltaX));

      const cells = document.querySelectorAll(
        `[data-column="${resizingColumn}"]`,
      );
      cells.forEach((cell) => {
        (cell as HTMLElement).style.width = `${newWidth}px`;
      });
    },
    [resizingColumn, startX, startWidth],
  );

  const handleColumnMouseUp = useCallback(() => {
    if (!resizingColumn) return;

    const cell = document.querySelector(
      `[data-column="${resizingColumn}"]`,
    ) as HTMLElement;
    const finalWidth = cell ? parseInt(cell.style.width) || 150 : 150;

    updateColumnWidth({
      sheetId,
      columnName: resizingColumn,
      width: finalWidth,
      testCaseType: "functionality",
    }).catch((error) => {
      console.error("Failed to update column width:", error);
    });

    setResizingColumn(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [resizingColumn, updateColumnWidth, sheetId]);

  React.useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  React.useEffect(() => {
    if (resizingColumn) {
      document.addEventListener("mousemove", handleColumnMouseMove);
      document.addEventListener("mouseup", handleColumnMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleColumnMouseMove);
        document.removeEventListener("mouseup", handleColumnMouseUp);
      };
    }
  }, [resizingColumn, handleColumnMouseMove, handleColumnMouseUp]);

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

  // Helper function to format text with numbering
  const formatWithNumbering = (text: string): string => {
    const lines = text
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.trim());
    
    return lines
      .map((line, index) => `${index + 1}.) ${line}`)
      .join('\n');
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

  return (
    <div className="flex flex-col">
      {/* Scrollable table container */}
      <div className="overflow-x-auto overflow-y-visible" style={{ maxWidth: '100%' }}>
        <table ref={tableRef} className="w-full border-collapse" style={{ minWidth: 'max-content' }}>
          <thead>
            <tr className="bg-gray-100">
              <th
                data-column="tcId"
                style={{ width: `${getColumnWidth("tcId", 80)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                TC ID
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "tcId", getColumnWidth("tcId", 80))}
                  style={{
                    background: resizingColumn === "tcId" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "tcId" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="level"
                style={{ width: `${getColumnWidth("level", 100)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                TC Level
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "level", getColumnWidth("level", 100))}
                  style={{
                    background: resizingColumn === "level" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "level" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="scenario"
                style={{ width: `${getColumnWidth("scenario", 120)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Scenarios
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "scenario", getColumnWidth("scenario", 120))}
                  style={{
                    background: resizingColumn === "scenario" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "scenario" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="module"
                style={{ width: `${getColumnWidth("module", 150)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Module
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "module", getColumnWidth("module", 150))}
                  style={{
                    background: resizingColumn === "module" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "module" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="subModule"
                style={{ width: `${getColumnWidth("subModule", 150)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Sub Module
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "subModule", getColumnWidth("subModule", 150))}
                  style={{
                    background: resizingColumn === "subModule" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "subModule" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="title"
                style={{ width: `${getColumnWidth("title", 200)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Test Case Title
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "title", getColumnWidth("title", 200))}
                  style={{
                    background: resizingColumn === "title" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "title" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="preConditions"
                style={{ width: `${getColumnWidth("preConditions", 180)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Pre Conditions
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "preConditions", getColumnWidth("preConditions", 180))}
                  style={{
                    background: resizingColumn === "preConditions" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "preConditions" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="steps"
                style={{ width: `${getColumnWidth("steps", 250)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Test Steps
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "steps", getColumnWidth("steps", 250))}
                  style={{
                    background: resizingColumn === "steps" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "steps" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="expectedResults"
                style={{ width: `${getColumnWidth("expectedResults", 250)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Expected Results
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "expectedResults", getColumnWidth("expectedResults", 250))}
                  style={{
                    background: resizingColumn === "expectedResults" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "expectedResults" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="status"
                style={{ width: `${getColumnWidth("status", 120)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Testing Status
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "status", getColumnWidth("status", 120))}
                  style={{
                    background: resizingColumn === "status" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "status" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="executedBy"
                style={{ width: `${getColumnWidth("executedBy", 150)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Executed By:
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "executedBy", getColumnWidth("executedBy", 150))}
                  style={{
                    background: resizingColumn === "executedBy" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "executedBy" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="jiraUserStory"
                style={{ width: `${getColumnWidth("jiraUserStory", 180)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Jira Associated User Stories
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "jiraUserStory", getColumnWidth("jiraUserStory", 180))}
                  style={{
                    background: resizingColumn === "jiraUserStory" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "jiraUserStory" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="createdBy"
                style={{ width: `${getColumnWidth("createdBy", 150)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Created By:
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "createdBy", getColumnWidth("createdBy", 150))}
                  style={{
                    background: resizingColumn === "createdBy" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "createdBy" ? 1 : undefined,
                  }}
                />
              </th>
              <th
                data-column="createdAt"
                style={{ width: `${getColumnWidth("createdAt", 130)}px`, position: "relative" }}
                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                Date of Creation
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleColumnMouseDown(e, "createdAt", getColumnWidth("createdAt", 130))}
                  style={{
                    background: resizingColumn === "createdAt" ? "#3b82f6" : "transparent",
                    opacity: resizingColumn === "createdAt" ? 1 : undefined,
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {testCases.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={14} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <p>No functionality test cases found.</p>
                    <button
                      onClick={handleAddNew}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add First Test Case
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {testCases.map((testCase) => (
                  <tr
                    key={testCase._id}
                    data-testcase-id={testCase._id}
                    className="hover:bg-gray-50 relative"
                    style={{ height: `${testCase.rowHeight || 20}px` }}
                  >
                    <td
                      data-column="tcId"
                      style={{ width: `${getColumnWidth("tcId", 80)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      TC_{String(testCase.sequenceNumber).padStart(3, '0')}
                    </td>
                    <td
                      data-column="level"
                      style={{ width: `${getColumnWidth("level", 100)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.level}
                    </td>
                    <td
                      data-column="scenario"
                      style={{ width: `${getColumnWidth("scenario", 120)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.scenario}
                    </td>
                    <td
                      data-column="module"
                      style={{ width: `${getColumnWidth("module", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.module ?? "N/A"}
                    </td>
                    <td
                      data-column="subModule"
                      style={{ width: `${getColumnWidth("subModule", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.subModule ?? "N/A"}
                    </td>
                    <td
                      data-column="title"
                      style={{ width: `${getColumnWidth("title", 200)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.title}
                    </td>
                    <td
                      data-column="preConditions"
                      style={{ width: `${getColumnWidth("preConditions", 180)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                    >
                      {testCase.preConditions ?? "N/A"}
                    </td>
                    <td
                      data-column="steps"
                      style={{ width: `${getColumnWidth("steps", 250)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                    >
                      {testCase.steps}
                    </td>
                    <td
                      data-column="expectedResults"
                      style={{ width: `${getColumnWidth("expectedResults", 250)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap"
                    >
                      {testCase.expectedResults}
                    </td>
                    <td
                      data-column="status"
                      style={{ width: `${getColumnWidth("status", 120)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.status}
                    </td>
                    <td
                      data-column="executedBy"
                      style={{ width: `${getColumnWidth("executedBy", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.executedByName}
                    </td>
                    <td
                      data-column="jiraUserStory"
                      style={{ width: `${getColumnWidth("jiraUserStory", 180)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {testCase.jiraUserStory}
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
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                      onMouseDown={(e) =>
                        handleMouseDown(e, testCase._id, testCase.rowHeight || 20)
                      }
                      style={{
                        background:
                          resizing === testCase._id ? "#3b82f6" : "transparent",
                        opacity: resizing === testCase._id ? 1 : undefined,
                      }}
                    />
                  </tr>
                ))}
                
                {/* New Row Input */}
                {isAdding && (
                  <tr className="bg-blue-50">
                    <td
                      data-column="tcId"
                      style={{ width: `${getColumnWidth("tcId", 80)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      TC_{String(testCases.length + 1).padStart(3, '0')}
                    </td>
                    <td
                      data-column="level"
                      style={{ width: `${getColumnWidth("level", 100)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        value={newTestCase.level}
                        onChange={(e) => setNewTestCase({...newTestCase, level: e.target.value as "High" | "Low"})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>
                    <td
                      data-column="scenario"
                      style={{ width: `${getColumnWidth("scenario", 120)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        value={newTestCase.scenario}
                        onChange={(e) => setNewTestCase({...newTestCase, scenario: e.target.value as "Happy Path" | "Unhappy Path"})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Happy Path">Happy Path</option>
                        <option value="Unhappy Path">Unhappy Path</option>
                      </select>
                    </td>
                    <td
                      data-column="module"
                      style={{ width: `${getColumnWidth("module", 150)}px` }} className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="text"
                        value={newTestCase.module}
                        onChange={(e) => setNewTestCase({...newTestCase, module: e.target.value})}
                        placeholder="Module"
                        maxLength={50}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td
                      data-column="subModule"
                      style={{ width: `${getColumnWidth("subModule", 150)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="text"
                        value={newTestCase.subModule}
                        onChange={(e) => setNewTestCase({...newTestCase, subModule: e.target.value})}
                        placeholder="Sub Module"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td
                      data-column="title"
                      style={{ width: `${getColumnWidth("title", 200)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="text"
                        value={newTestCase.title}
                        onChange={(e) => setNewTestCase({...newTestCase, title: e.target.value})}
                        placeholder="Title *"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td
                      data-column="preConditions"
                      style={{ width: `${getColumnWidth("preConditions", 180)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <NumberedTextarea
                        value={newTestCase.preConditions}
                        onChange={(value) => setNewTestCase({...newTestCase, preConditions: value})}
                        placeholder="Pre Conditions"
                        rows={3}
                        className="text-sm"
                      />
                    </td>
                    <td
                      data-column="steps"
                      style={{ width: `${getColumnWidth("steps", 250)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <NumberedTextarea
                        value={newTestCase.steps}
                        onChange={(value) => setNewTestCase({...newTestCase, steps: value})}
                        placeholder="Test Steps *"
                        rows={3}
                        className="text-sm"
                      />
                    </td>
                    <td
                      data-column="expectedResults"
                      style={{ width: `${getColumnWidth("expectedResults", 250)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <NumberedTextarea
                        value={newTestCase.expectedResults}
                        onChange={(value) => setNewTestCase({...newTestCase, expectedResults: value})}
                        placeholder="Expected Results *"
                        rows={3}
                        className="text-sm"
                      />
                    </td>
                    <td
                      data-column="status"
                      style={{ width: `${getColumnWidth("status", 120)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <select
                        value={newTestCase.status}
                        onChange={(e) => setNewTestCase({...newTestCase, status: e.target.value as NewTestCase['status']})}
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
                      data-column="executedBy"
                      style={{ width: `${getColumnWidth("executedBy", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      N/A
                    </td>
                    <td
                      data-column="jiraUserStory"
                      style={{ width: `${getColumnWidth("jiraUserStory", 180)}px` }}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="text"
                        value={newTestCase.jiraUserStory}
                        onChange={(e) => setNewTestCase({...newTestCase, jiraUserStory: e.target.value})}
                        placeholder="Jira User Story"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td
                      data-column="createdBy"
                      style={{ width: `${getColumnWidth("createdBy", 150)}px` }}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
                    >
                      You
                    </td>
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
      {testCases.length > 0 && !isAdding && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add New Test Case
          </button>
        </div>
      )}

      {/* Action Buttons for New Row */}
      {isAdding && (
        <div className="flex justify-center gap-2 py-4">
          <button
            onClick={handleSaveNew}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} />
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancelNew}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      )}

      {/* Visual feedback during resize */}
      {resizing && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
          Resizing row...
        </div>
      )}
      {resizingColumn && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
          Resizing column...
        </div>
      )}
    </div>
  );
}