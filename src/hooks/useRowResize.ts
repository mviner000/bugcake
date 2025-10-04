// src/hooks/useRowResize.ts

import { useState, useCallback, useEffect } from "react";

interface UseRowResizeOptions {
  onResizeComplete: (rowId: string, height: number) => Promise<void>;
}

export function useRowResize({ onResizeComplete }: UseRowResizeOptions) {
  const [resizingRow, setResizingRow] = useState<string | null>(null);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  const handleRowMouseDown = useCallback(
    (e: React.MouseEvent, rowId: string, currentHeight: number) => {
      e.preventDefault();
      setResizingRow(rowId);
      setStartY(e.clientY);
      setStartHeight(currentHeight);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    []
  );

  const handleRowMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingRow) return;

      const deltaY = e.clientY - startY;
      const newHeight = Math.max(20, Math.min(500, startHeight + deltaY));

      const row = document.querySelector(`tr[data-testcase-id="${resizingRow}"]`) as HTMLElement;
      if (row) {
        row.style.height = `${newHeight}px`;
      }
    },
    [resizingRow, startY, startHeight]
  );

  const handleRowMouseUp = useCallback(() => {
    if (!resizingRow) return;

    const row = document.querySelector(`tr[data-testcase-id="${resizingRow}"]`) as HTMLElement;
    const finalHeight = row ? parseInt(row.style.height, 10) : startHeight;

    onResizeComplete(resizingRow, finalHeight);

    setResizingRow(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [resizingRow, startHeight, onResizeComplete]);

  useEffect(() => {
    if (resizingRow) {
      document.addEventListener("mousemove", handleRowMouseMove);
      document.addEventListener("mouseup", handleRowMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleRowMouseMove);
        document.removeEventListener("mouseup", handleRowMouseUp);
      };
    }
  }, [resizingRow, handleRowMouseMove, handleRowMouseUp]);

  return {
    resizingRow,
    handleRowMouseDown,
  };
}