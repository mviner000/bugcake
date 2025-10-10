// src/components/common/ModuleNamebar.tsx

interface ModuleNamebarProps {
  title: string;
  bgColor: string;
  textColor: string;
  className?: string;
  isChecked: boolean;
  isIndeterminate: boolean;
  onCheckboxChange: (checked: boolean) => void;
}

export function ModuleNamebar({
  title,
  bgColor,
  textColor,
  isChecked,
  isIndeterminate,
  onCheckboxChange,
  className = "",
}: ModuleNamebarProps) {
  return (
    <div
      className={`absolute inset-0 w-full ${className}`}
      style={{ height: "30px" }}
    >
      {/* Checkbox */}
      <label className="mt-3 sticky left-4 z-10 flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="ml-[8px] appearance-none w-[13px] h-[13px] border-[0.5px] border-[#171717] rounded-[3px] checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
          checked={isChecked}
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
          onChange={(e) => onCheckboxChange(e.target.checked)}
        />
      </label>

      {/* Title Button */}
      <button
        className="ml-11 sticky left-4 top-3/4 -translate-y-3/4 z-10 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        style={{ lineHeight: "normal", fontSize: "14px" }}
      >
        {title}
      </button>

      {/* Add Button */}
      <button
        className="ml-2 cursor-pointer sticky left-24 top-3/4 -translate-y-3/4 z-10 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        style={{ lineHeight: "normal", fontSize: "14px" }}
      >
        Add
      </button>
    </div>
  );
}
