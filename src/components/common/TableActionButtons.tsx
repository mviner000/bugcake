// src/components/common/TableActionButtons.tsx

import React from "react";
import { Plus, Check, X } from "lucide-react";

interface TableActionButtonsProps {
  isAdding: boolean;
  isSaving?: boolean;
  onAdd: () => void;
  onSave: () => void;
  onCancel: () => void;
  addButtonText?: string;
  saveButtonText?: string;
}

export const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  isAdding,
  isSaving = false,
  onAdd,
  onSave,
  onCancel,
  addButtonText = "Add New Test Case",
  saveButtonText = "Save",
}) => {
  if (isAdding) {
    return (
      <div className="flex justify-center gap-2 py-4">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={16} />
          {isSaving ? "Saving..." : saveButtonText}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-4">
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        <Plus size={16} />
        {addButtonText}
      </button>
    </div>
  );
};