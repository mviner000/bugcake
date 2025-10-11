// full code src/components/common/EmptyTableState.tsx

import React, { useState, useEffect } from "react";
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
  colSpan,
  modules,
  sheetId,
  onModuleAddClick,
  isAdding,
  activeAddingModuleId,
  renderNewTestCaseRow,
  getColumnWidth,
}) => {
  const [messageLeftPosition, setMessageLeftPosition] = useState(40);

  useEffect(() => {
    const updatePosition = () => {
      
      // Position message on the left side with padding
      const calculatedMessagePosition = 40; // Fixed left padding
      
      setMessageLeftPosition(calculatedMessagePosition);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

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

      {/* Empty State Message - Sticky Positioned on Left */}
      <tr>
        <td colSpan={colSpan} className="py-8 text-gray-500">
          <div 
            className="sticky left-10 flex flex-col gap-2 w-fit"
            style={{ left: `${messageLeftPosition}px` }}
          >
            <p>{message}</p>
          </div>
        </td>
      </tr>
    </>
  );
};