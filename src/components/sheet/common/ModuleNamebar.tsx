// src/components/common/ModuleNamebar.tsx

interface ModuleNamebarProps {
  title?: string
  bgColor?: string
  textColor?: string
  className?: string
  // Checkbox props
  isChecked?: boolean
  isIndeterminate?: boolean
  onCheckboxChange?: (checked: boolean) => void
}

export function ModuleNamebar({
  title = "",
  bgColor = "bg-blue-600",
  textColor = "text-white",
  className = "",
  isChecked = false,
  isIndeterminate = false,
  onCheckboxChange,
}: ModuleNamebarProps) {
  return (
    <div className={`${bgColor} ${textColor} px-6 py-3 font-semibold text-lg flex items-center gap-3 ${className}`}>
      {onCheckboxChange && (
        <input
          type="checkbox"
          checked={isChecked}
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
          onChange={(e) => onCheckboxChange(e.target.checked)}
          className="cursor-pointer w-4 h-4"
        />
      )}
      <span>{title}</span>
    </div>
  )
}