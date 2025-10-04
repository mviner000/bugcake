// src/hooks/useColumnWidths.ts

import { useState, useEffect } from "react";

interface ColumnWidth {
  columnName: string;
  width: number;
}

export function useColumnWidths(fetchedColumnWidths: ColumnWidth[] | undefined) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    if (fetchedColumnWidths && Array.isArray(fetchedColumnWidths)) {
      const widths = fetchedColumnWidths.reduce<Record<string, number>>((acc, item) => {
        if (item?.columnName && typeof item.width === "number") {
          acc[item.columnName] = item.width;
        }
        return acc;
      }, {});
      setColumnWidths(widths);
    }
  }, [fetchedColumnWidths]);

  const getColumnWidth = (columnName: string, defaultWidth: number): number => {
    return columnWidths[columnName] || defaultWidth;
  };

  return { columnWidths, getColumnWidth };
}