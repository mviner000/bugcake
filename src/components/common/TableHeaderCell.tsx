// src/components/common/TableHeaderCell.tsx

import React from "react";
import { ResizeHandle } from "./ResizeHandle";

interface TableHeaderCellProps {
  columnKey: string;
  label: string;
  width: number;
  isResizing: boolean;
  onResizeStart: (e: React.MouseEvent, columnKey: string, width: number) => void;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  columnKey,
  label,
  width,
  isResizing,
  onResizeStart,
}) => {
  return (
    <th
      data-column={columnKey}
      style={{ width: `${width}px`, position: "relative" }}
      className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700"
    >
      {label}
      <ResizeHandle
        direction="column"
        isResizing={isResizing}
        onMouseDown={(e) => onResizeStart(e, columnKey, width)}
      />
    </th>
  );
};