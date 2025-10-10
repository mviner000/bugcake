// src/components/sheet/common/RequestForModuleAccessButton.tsx

interface RequestForModuleAccessButtonProps {
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export function RequestForModuleAccessButton({
  onClick,
  className = "",
  style,
}: RequestForModuleAccessButtonProps) {
  return (
    <button
      onClick={onClick} // ✅ Add this line
      className={`cursor-pointer border border-[#333333] text-[#333333] bg-transparent px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors ${className}`}
      style={{
        lineHeight: "normal",
        fontSize: "14px",
        ...style,
      }}
    >
      <span className="font-bold">Request</span>
    </button>
  )
}
