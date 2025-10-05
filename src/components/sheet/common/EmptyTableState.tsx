// src/components/common/EmptyTableState.tsx

import React from "react";
import { Plus } from "lucide-react";

interface EmptyTableStateProps {
  message: string;
  onAdd: () => void;
  buttonText?: string;
  colSpan: number;
}

export const EmptyTableState: React.FC<EmptyTableStateProps> = ({
  message,
  onAdd,
  buttonText = "Add First Test Case",
  colSpan,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <p>{message}</p>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            {buttonText}
          </button>
        </div>
      </td>
    </tr>
  );
};