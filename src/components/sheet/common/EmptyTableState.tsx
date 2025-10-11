// src/components/common/EmptyTableState.tsx

import React from "react";
import { Plus, FolderOpen } from "lucide-react";

interface EmptyTableStateProps {
  message: string;
  onAdd: () => void;
  buttonText?: string;
  colSpan: number;
  modules?: Array<{ _id: string; name: string }>; // NEW: Optional modules prop
}

export const EmptyTableState: React.FC<EmptyTableStateProps> = ({
  message,
  onAdd,
  buttonText = "Add First Test Case",
  colSpan,
  modules, // NEW: Destructure modules
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 text-gray-500">
        <div className="flex flex-col items-center gap-4">
          <p>{message}</p>
          
          {/* NEW: Display modules if provided */}
          {modules && modules.length > 0 && (
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FolderOpen size={16} />
                <span className="font-medium">Available Modules:</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                {modules.map((module) => (
                  <span
                    key={module._id}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                  >
                    {module.name}
                  </span>
                ))}
              </div>
            </div>
          )}

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