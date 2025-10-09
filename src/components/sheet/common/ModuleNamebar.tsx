// src/components/common/ModuleNamebar.tsx

interface ModuleNamebarProps {
  title: string;
  bgColor: string;
  textColor: string;
  className?: string
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
  className="",
}: ModuleNamebarProps) {
  return (
    <div  
  style={{ 
    backgroundColor: bgColor, 
  }} 
  className={`${textColor} font-medium text-[14px] -ml-1 border-x border-gray-300 px-2 py-2 flex items-center ${className}`}
>
  {onCheckboxChange && (
    <input
      type="checkbox"
      checked={isChecked}
      ref={(el) => {
        if (el) el.indeterminate = isIndeterminate;
      }}
      onChange={(e) => onCheckboxChange(e.target.checked)}
      className="cursor-pointer ml-[3px] w-3.5 h-3.5"
    />
  )}
  <span className="ml-5">{title}</span>
</div>

  )
}