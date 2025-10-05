// src/components/common/ResizeFeedback.tsx

import React from "react";

interface ResizeFeedbackProps {
  isResizingRow: boolean;
  isResizingColumn: boolean;
}

export const ResizeFeedback: React.FC<ResizeFeedbackProps> = ({
  isResizingRow,
  isResizingColumn,
}) => {
  if (!isResizingRow && !isResizingColumn) return null;

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm z-50">
      {isResizingRow ? "Resizing row..." : "Resizing column..."}
    </div>
  );
};