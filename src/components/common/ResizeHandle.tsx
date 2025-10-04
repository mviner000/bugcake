// src/components/common/ResizeHandle.tsx

import React from "react";

interface ResizeHandleProps {
  direction: "row" | "column";
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  isResizing,
  onMouseDown,
}) => {
  const isRow = direction === "row";
  
  return (
    <div
      className={`absolute ${
        isRow
          ? "bottom-0 left-0 right-0 h-1 cursor-row-resize"
          : "top-0 right-0 bottom-0 w-1 cursor-col-resize"
      } hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity`}
      onMouseDown={onMouseDown}
      style={{
        background: isResizing ? "#3b82f6" : "transparent",
        opacity: isResizing ? 1 : undefined,
      }}
    />
  );
};