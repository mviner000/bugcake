// src/components/common/ModuleNamebar.tsx

interface ModuleNamebarProps {
  title?: string
  bgColor?: string
  textColor?: string
  className?: string
}

export function ModuleNamebar({
  title = "",
  bgColor = "bg-blue-600",
  textColor = "text-white",
  className = "",
}: ModuleNamebarProps) {
  return <div className={`${bgColor} ${textColor} px-6 py-3 font-semibold text-lg ${className}`}>{title}</div>
}
