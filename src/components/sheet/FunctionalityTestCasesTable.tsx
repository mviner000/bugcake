// src/components/sheet/FunctionalityTestCasesTable.tsx

import { Doc } from "convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import React, { useState, useRef, useCallback } from "react";
import { Plus, Check, X } from "lucide-react";

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
  
  const [resizing, setResizing] = useState<string | null>(null);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
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
      .filter(line => line.trim() !== '') // Remove empty lines
      .map(line => line.trim());
    
    // Add numbering to each line
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
    <div className="overflow-x-auto">
      <table ref={tableRef} className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              TC ID
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              TC Level
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Scenarios
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Module
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Sub Module
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Test Case Title
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Pre Conditions
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Test Steps
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Expected Results
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Testing Status
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Executed By:
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Jira Associated User Stories
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Created By:
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
              Date of Creation
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
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    TC_{String(testCase.sequenceNumber).padStart(3, '0')}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.level}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.scenario}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.module ?? "N/A"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.subModule ?? "N/A"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.title}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.preConditions ?? "N/A"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap">
                    {testCase.steps}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap">
                    {testCase.expectedResults}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.status}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.executedByName}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.jiraUserStory}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {testCase.createdByName}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
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
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-500">
                    TC_{String(testCases.length + 1).padStart(3, '0')}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <select
                      value={newTestCase.level}
                      onChange={(e) => setNewTestCase({...newTestCase, level: e.target.value as "High" | "Low"})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <select
                      value={newTestCase.scenario}
                      onChange={(e) => setNewTestCase({...newTestCase, scenario: e.target.value as "Happy Path" | "Unhappy Path"})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Happy Path">Happy Path</option>
                      <option value="Unhappy Path">Unhappy Path</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <input
                      type="text"
                      value={newTestCase.module}
                      onChange={(e) => setNewTestCase({...newTestCase, module: e.target.value})}
                      placeholder="Module"
                      maxLength={50}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <input
                      type="text"
                      value={newTestCase.subModule}
                      onChange={(e) => setNewTestCase({...newTestCase, subModule: e.target.value})}
                      placeholder="Sub Module"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <input
                      type="text"
                      value={newTestCase.title}
                      onChange={(e) => setNewTestCase({...newTestCase, title: e.target.value})}
                      placeholder="Title *"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <textarea
                      value={newTestCase.preConditions}
                      onChange={(e) => setNewTestCase({...newTestCase, preConditions: e.target.value})}
                      placeholder="Pre Conditions"
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <textarea
                      value={newTestCase.steps}
                      onChange={(e) => setNewTestCase({...newTestCase, steps: e.target.value})}
                      placeholder="Test Steps *"
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <textarea
                      value={newTestCase.expectedResults}
                      onChange={(e) => setNewTestCase({...newTestCase, expectedResults: e.target.value})}
                      placeholder="Expected Results *"
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
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
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-500">
                    N/A
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <input
                      type="text"
                      value={newTestCase.jiraUserStory}
                      onChange={(e) => setNewTestCase({...newTestCase, jiraUserStory: e.target.value})}
                      placeholder="Jira User Story"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-500">
                    You
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-500">
                    Now
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>

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
    </div>
  );
}