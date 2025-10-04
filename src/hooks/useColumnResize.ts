// src/hooks/useColumnResize.ts

import { useState, useCallback, useEffect } from "react";

interface UseColumnResizeOptions {
  onResizeComplete: (columnName: string, width: number) => Promise<void>;
}

export function useColumnResize({ onResizeComplete }: UseColumnResizeOptions) {
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

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
    []
  );

  const handleColumnMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingColumn) return;

      const deltaX = e.clientX - startX;
      const newWidth = Math.max(50, Math.min(1000, startWidth + deltaX));

      const cells = document.querySelectorAll(`[data-column="${resizingColumn}"]`);
      cells.forEach((cell) => {
        (cell as HTMLElement).style.width = `${newWidth}px`;
      });
    },
    [resizingColumn, startX, startWidth]
  );

  const handleColumnMouseUp = useCallback(() => {
    if (!resizingColumn) return;

    const cell = document.querySelector(`[data-column="${resizingColumn}"]`) as HTMLElement;
    const finalWidth = cell ? parseInt(cell.style.width) || startWidth : startWidth;

    onResizeComplete(resizingColumn, finalWidth).catch((error) => {
      console.error("Failed to update column width:", error);
    });

    setResizingColumn(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [resizingColumn, startWidth, onResizeComplete]);

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener("mousemove", handleColumnMouseMove);
      document.addEventListener("mouseup", handleColumnMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleColumnMouseMove);
        document.removeEventListener("mouseup", handleColumnMouseUp);
      };
    }
  }, [resizingColumn, handleColumnMouseMove, handleColumnMouseUp]);

  return {
    resizingColumn,
    handleColumnMouseDown,
  };
}