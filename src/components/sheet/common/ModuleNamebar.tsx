// src/components/sheet/common/ModuleNamebar.tsx

interface ModuleNamebarProps {
  title: string;
  bgColor: string;
  textColor: string;
  className?: string;
  isChecked: boolean;
  isIndeterminate: boolean;
  onCheckboxChange: (checked: boolean) => void;
  itemCount?: number; // ✅ optional
}

export function ModuleNamebar({
  title,
  bgColor,
  isChecked,
  isIndeterminate,
  onCheckboxChange,
  className = "",
  itemCount,
}: ModuleNamebarProps) {
  return (
    <div
      className={`mt-[4px] absolute inset-0 w-full ${className} border-b-4 z-1`}
      style={{
        height: "44px",
        borderBottomColor: bgColor,
      }}
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
        className=" ml-11 sticky left-4 top-3/4 -translate-y-3/4 z-10 bg-blue-500 text-white px-3 py-[2.6px] border border-blue-500 transition-colors rounded-none"
        style={{ lineHeight: "normal", fontSize: "14px" }}
      >
        <span>{title}</span>

        {/* ✅ Facebook-like red badge */}
        {itemCount !== undefined && itemCount > 0 && (
          <span
            className="absolute -top-2 -right-2 border border-[#333333] bg-white text-[#333333] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
          >
            {itemCount}
          </span>
        )}
      </button>


      {/* Add Button */}
      <button
        className="ml-4 cursor-pointer sticky left-24 top-3/4 -translate-y-3/4 z-10 border border-[#333333] text-[#333333] bg-transparent px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors"
        style={{ lineHeight: "normal", fontSize: "14px" }}
      >
        <span className="font-bold">+ Add New</span>
      </button>
    </div>
  );
}
