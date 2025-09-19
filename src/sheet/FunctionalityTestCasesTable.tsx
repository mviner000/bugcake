// src/sheet/FunctionalityTestCasesTable.tsx

import { Doc } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import React, { useState, useRef, useCallback } from "react";

interface FunctionalityTestCasesTableProps {
  testCases: Doc<"functionalityTestCases">[];
}

export function FunctionalityTestCasesTable({
  testCases,
}: FunctionalityTestCasesTableProps) {
  const updateRowHeight = useMutation(
    api.myFunctions.updateFunctionalityTestCaseRowHeight,
  );
  const [resizing, setResizing] = useState<string | null>(null);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
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

      // Update the row height visually during drag
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

    // Update in background without awaiting
    updateRowHeight({
      testCaseId: resizing,
      rowHeight: finalHeight,
    }).catch((error) => {
      console.error("Failed to update row height:", error);
      // Revert the visual change if the update failed
      if (row) {
        const originalTestCase = testCases.find((tc) => tc._id === resizing);
        row.style.height = `${originalTestCase?.rowHeight || 20}px`;
      }
    });

    setResizing(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [resizing, updateRowHeight, testCases]);

  // Add event listeners for mouse move and mouse up
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
              Testing
            </th>
          </tr>
        </thead>
        <tbody>
          {testCases.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-4 text-gray-500">
                No functionality test cases found.
              </td>
            </tr>
          ) : (
            testCases.map((testCase) => (
              <tr
                key={testCase._id}
                data-testcase-id={testCase._id}
                className="hover:bg-gray-50 relative"
                style={{ height: `${testCase.rowHeight || 20}px` }}
              >
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {testCase._id}
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
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {testCase.steps}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {testCase.expectedResults}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {testCase.status}
                </td>
                {/* Row resize handle */}
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
            ))
          )}
        </tbody>
      </table>

      {/* Visual feedback during resize */}
      {resizing && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
          Resizing row...
        </div>
      )}
    </div>
  );
}
