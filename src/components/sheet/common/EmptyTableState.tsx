// src/components/common/EmptyTableState.tsx

import React from "react";
import { Plus } from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { ModuleNamebar } from "@/components/sheet/common/ModuleNamebar";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface ModuleWithDetails {
  _id: Id<"modules">;
  name: string;
}

interface EmptyTableStateProps {
  message: string;
  onAdd: () => void;
  buttonText?: string;
  colSpan: number;
  modules?: ModuleWithDetails[];
  sheetId?: Id<"sheets">;
  onModuleAddClick?: (moduleId: string) => void;
  // NEW: Props for rendering the input form
  isAdding?: boolean;
  activeAddingModuleId?: string | null;
  renderNewTestCaseRow?: (helpers: {
    getColumnWidth: (key: string, defaultWidth: number) => number;
    preselectedModuleId?: string;
  }) => React.ReactNode;
  getColumnWidth?: (key: string, defaultWidth: number) => number;
}

/**
 * Wrapper component to fetch access data for each module
 */
function ModuleNamebarWithAccess({
  moduleId,
  sheetId,
  moduleName,
  index,
  onAddClick,
}: {
  moduleId: Id<"modules">;
  sheetId: Id<"sheets">;
  moduleName: string;
  index: number;
  onAddClick: () => void;
}) {
  const accessData = useQuery(api.myFunctions.getUserModuleAccess, {
    moduleId: moduleId,
    sheetId: sheetId,
  });

  // Generate color based on index
  const hue = (index * 137.5) % 360;
  const bgColor = `hsl(${hue}, 70%, 85%)`;
  const textColor = "#333333";

  return (
    <div className="relative h-[46px] border-b-4" style={{ borderBottomColor: bgColor }}>
      <ModuleNamebar
        title={moduleName}
        itemCount={0}
        bgColor={bgColor}
        textColor={textColor}
        isChecked={false}
        isIndeterminate={false}
        onCheckboxChange={() => {}} // No-op for empty state
        moduleId={moduleId}
        sheetId={sheetId}
        currentUserRole={accessData?.role}
        currentUserModuleAccessStatus={accessData?.moduleAccessStatus}
        onAddClick={onAddClick}
      />
    </div>
  );
}

export const EmptyTableState: React.FC<EmptyTableStateProps> = ({
  message,
  onAdd,
  buttonText = "Add First Test Case",
  colSpan,
  modules,
  sheetId,
  onModuleAddClick,
  isAdding,
  activeAddingModuleId,
  renderNewTestCaseRow,
  getColumnWidth,
}) => {
  return (
    <>
      {/* Module Namebars Section */}
      {modules && modules.length > 0 && sheetId && (
        <>
          {modules.map((module, index) => (
            <React.Fragment key={module._id}>
              {/* Module Namebar Row */}
              <tr>
                <td colSpan={colSpan} className="p-0">
                  <ModuleNamebarWithAccess
                    moduleId={module._id}
                    sheetId={sheetId}
                    moduleName={module.name}
                    index={index}
                    onAddClick={() => onModuleAddClick?.(module._id)}
                  />
                </td>
              </tr>

              {/* ✅ NEW: Render input form directly after module namebar if active */}
              {isAdding && 
               activeAddingModuleId === module._id && 
               renderNewTestCaseRow && 
               getColumnWidth && (
                <tr className="relative z-50">
                  <td colSpan={colSpan} className="p-0">
                    <div className="relative">
                      {renderNewTestCaseRow({
                        getColumnWidth,
                        preselectedModuleId: module._id,
                      })}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </>
      )}

      {/* Empty State Message */}
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
    </>
  );
};