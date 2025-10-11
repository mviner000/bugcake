// src/components/common/TableActionButtons.tsx

import React from "react";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="bg-white/80 flex justify-center gap-2 py-4">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="
            flex items-center gap-2
            bg-blue-600 text-white
            hover:bg-blue-700 active:bg-blue-800
          "
        >
          <Check size={16} />
          {isSaving ? "Saving..." : saveButtonText}
        </Button>
        <Button
          onClick={onCancel}
          disabled={isSaving}
          className="
            flex items-center gap-2
           "
           variant="outline"
        >
          <X size={16} />
          Cancel
        </Button>
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