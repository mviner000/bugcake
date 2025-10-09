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
  
  // For row handles, wrap in a td element to maintain valid HTML structure
  if (isRow) {
    return (
      <td
        className="border-0 p-0"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          cursor: "row-resize",
          background: isResizing ? "#3b82f6" : "transparent",
          opacity: isResizing ? 1 : 0,
          pointerEvents: "all",
          zIndex: 10,
        }}
        onMouseDown={onMouseDown}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.opacity = "1";
          (e.target as HTMLElement).style.background = "#93c5fd";
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            (e.target as HTMLElement).style.opacity = "0";
            (e.target as HTMLElement).style.background = "transparent";
          }
        }}
      />
    );
  }
  
  // For column handles, keep as span (valid within th/td)
  return (
    <span
      className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
      onMouseDown={onMouseDown}
      style={{
        background: isResizing ? "#3b82f6" : "transparent",
        opacity: isResizing ? 1 : undefined,
      }}
    />
  );
};