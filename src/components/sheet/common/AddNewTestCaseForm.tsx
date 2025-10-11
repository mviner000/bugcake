// src/components/sheet/common/AddNewTestCaseForm.tsx

import React from "react";
import { Doc } from "convex/_generated/dataModel";
import { TableColumn } from "@/components/sheet/common/types/testCaseTypes";

interface FormField {
  key: string;
  type: 'text' | 'textarea' | 'select' | 'numberedTextarea' | 'url' | 'readonly';
  value: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  rows?: number;
  disabled?: boolean; // ✅ NEW: Support for disabled fields
}

interface AddNewTestCaseFormProps {
  columns: TableColumn[];
  formFields: FormField[];
  onFieldChange: (key: string, value: string) => void;
  getColumnWidth: (key: string, defaultWidth: number) => number;
  modules?: Doc<"modules">[];
  nextSequenceNumber: number;
  NumberedTextareaComponent?: React.ComponentType<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
  }>;
}

export function AddNewTestCaseForm({
  columns,
  formFields,
  onFieldChange,
  getColumnWidth,
  modules,
  nextSequenceNumber,
  NumberedTextareaComponent,
}: AddNewTestCaseFormProps) {
  
  const renderFormField = (field: FormField) => {
    const baseInputClass = "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-50";
    // ✅ NEW: Add disabled styling
    const disabledClass = field.disabled 
      ? "bg-gray-100 cursor-not-allowed text-gray-600" 
      : "bg-white";

    switch (field.type) {
      case 'readonly':
        return (
          <span className="text-sm text-gray-500">
            {field.value}
          </span>
        );

      case 'select':
        return (
          <select
            value={field.value}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            disabled={field.disabled} // ✅ NEW: Apply disabled state
            className={`${baseInputClass} ${disabledClass}`}
          >
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={field.value}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 2}
            disabled={field.disabled} // ✅ NEW: Apply disabled state
            className={`${baseInputClass} ${disabledClass}`}
          />
        );

      case 'numberedTextarea':
        if (NumberedTextareaComponent) {
          return (
            <NumberedTextareaComponent
              value={field.value}
              onChange={(value) => onFieldChange(field.key, value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              className={`text-sm ${field.disabled ? disabledClass : ''}`}
            />
          );
        }
        // Fallback to regular textarea if NumberedTextarea not provided
        return (
          <textarea
            value={field.value}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            disabled={field.disabled} // ✅ NEW: Apply disabled state
            className={`${baseInputClass} ${disabledClass}`}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={field.value}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled} // ✅ NEW: Apply disabled state
            className={`${baseInputClass} ${disabledClass}`}
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={field.value}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled} // ✅ NEW: Apply disabled state
            className={`${baseInputClass} ${disabledClass}`}
          />
        );
    }
  };

  const getFieldForColumn = (columnKey: string): FormField | null => {
    // Handle special cases
    if (columnKey === 'checkbox') {
      return null; // Empty cell
    }
    
    if (columnKey === 'workflowStatus') {
      return {
        key: 'workflowStatus',
        type: 'readonly',
        value: 'Open',
      };
    }

    if (columnKey === 'tcId') {
      return {
        key: 'tcId',
        type: 'readonly',
        value: `TC_${String(nextSequenceNumber).padStart(3, '0')}`,
      };
    }

    if (columnKey === 'module' && modules) {
      const moduleField = formFields.find(f => f.key === 'module');
      if (moduleField) {
        return {
          ...moduleField,
          type: 'select',
          options: [
            { value: '', label: 'Select Module' },
            ...modules.map(m => ({ value: m._id, label: m.name }))
          ],
          disabled: moduleField.disabled, // ✅ NEW: Preserve disabled state
        };
      }
    }

    return formFields.find(f => f.key === columnKey) || null;
  };

  return (
    <tr className="bg-blue-50 border-l-4 border-blue-500 relative z-50">
      {columns.map((column) => {
        const field = getFieldForColumn(column.key);
        const width = getColumnWidth(column.key, column.width);

        if (column.key === 'checkbox') {
          return (
            <td
              key={column.key}
              data-column={column.key}
              style={{ width: `${width}px` }}
              className="border border-gray-300 px-2 py-2 text-center"
            />
          );
        }

        if (column.key === 'workflowStatus') {
          return (
            <td
              key={column.key}
              data-column={column.key}
              style={{ width: `${width}px` }}
              className="border border-gray-300 px-3 py-2"
            >
              <div className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Open
              </div>
            </td>
          );
        }

        if (!field) {
          return (
            <td
              key={column.key}
              data-column={column.key}
              style={{ width: `${width}px` }}
              className="border border-gray-300 px-3 py-2 text-sm text-gray-500"
            >
              N/A
            </td>
          );
        }

        return (
          <td
            key={column.key}
            data-column={column.key}
            style={{ width: `${width}px` }}
            className="border border-gray-300 px-3 py-2"
          >
            {renderFormField(field)}
          </td>
        );
      })}
    </tr>
  );
}