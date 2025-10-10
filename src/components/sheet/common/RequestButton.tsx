// src/components/sheet/common/RequestButton.tsx

interface RequestButtonProps {
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export function RequestButton({ onClick, className = "", style }: RequestButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      alert("You requested success")
    }
  }

  return (
    <button
      className={`cursor-pointer border border-[#333333] text-[#333333] bg-transparent px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors ${className}`}
      style={{ 
        lineHeight: "normal", 
        fontSize: "14px",
        ...style
      }}
      onClick={handleClick}
    >
      <span className="font-bold">Request</span>
    </button>
  )
}