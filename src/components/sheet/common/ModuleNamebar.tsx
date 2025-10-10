// src/components/sheet/common/ModuleNamebar.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, useRef } from "react"
import { AssigneeModal } from "./AssigneeModal"

interface TeamMember {
  name: string
  avatar: string
  fallback: string
}

interface ModuleNamebarProps {
  title: string
  bgColor: string
  textColor: string
  className?: string
  isChecked: boolean
  isIndeterminate: boolean
  onCheckboxChange: (checked: boolean) => void
  itemCount?: number // ✅ optional
  members?: TeamMember[] // ✅ added to receive members
}

export function ModuleNamebar({
  title,
  bgColor,
  isChecked,
  isIndeterminate,
  onCheckboxChange,
  className = "",
  itemCount,
  members, // ✅ destructured
}: ModuleNamebarProps) {
  const [avatarLeftPosition, setAvatarLeftPosition] = useState(1000)
  const [addButtonLeftPosition, setAddButtonLeftPosition] = useState(112)
  const titleButtonRef = useRef<HTMLButtonElement>(null)

  
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false)

  useEffect(() => {
    const updatePosition = () => {
      const screenWidth = window.innerWidth
      const titleButtonWidth = titleButtonRef.current?.offsetWidth || 0
      
      // Calculate dynamic position based on screen width
      // MODIFIED: Reduced offset from 300px to 185px to move avatars closer to the right edge
      const calculatedAvatarPosition = screenWidth - 185 
      
      // Calculate the start position for the Add Button:
      // Title Button's 'ml-11' (44px) + its 'left-4' (16px) + its width = 60px + width
      const calculatedAddButtonPosition = 60 + titleButtonWidth 

      setAvatarLeftPosition(calculatedAvatarPosition)
      setAddButtonLeftPosition(calculatedAddButtonPosition)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition) // Update on scroll for sticky positioning
    
    // Use ResizeObserver to track title button width changes
    const resizeObserver = new ResizeObserver(updatePosition)
    if (titleButtonRef.current) {
      resizeObserver.observe(titleButtonRef.current)
    }
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
      resizeObserver.disconnect()
    }
  }, [])

  const defaultMembers: TeamMember[] = [
    {
      name: "Team Member 1",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TM",
      fallback: "TM",
    },
    {
      name: "Team Member 2",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=JD",
      fallback: "JD",
    },
    {
      name: "Team Member 3",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SK",
      fallback: "SK",
    },
    {
      name: "Team Member 4",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AL",
      fallback: "AL",
    },
    {
      name: "Team Member 5",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MR",
      fallback: "MR",
    },
  ]

  const teamMembers = members || defaultMembers

  return (
    <>
    <AssigneeModal
          open={isAssigneeModalOpen}
          onOpenChange={setIsAssigneeModalOpen}
          moduleName="modulename"
          sheetId="demo-sheet-id"
        />
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
            if (el) el.indeterminate = isIndeterminate
          }}
          onChange={(e) => onCheckboxChange(e.target.checked)}
        />
      </label>

      {/* Title Button */}
      <button
        ref={titleButtonRef}
        className="ml-11 sticky left-4 top-3/4 -translate-y-3/4 z-10 bg-blue-500 text-white px-3 py-[2.6px] border border-blue-500 transition-colors rounded-none"
        style={{ lineHeight: "normal", fontSize: "14px" }}
      >
        <span>{title}</span>

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
        className="ml-4 cursor-pointer sticky top-3/4 -translate-y-[65%] z-10 border border-[#333333] text-[#333333] bg-transparent px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors"
        style={{ 
          lineHeight: "normal", 
          fontSize: "14px", 
          left: `calc(${addButtonLeftPosition}px - 28px)` 
        }}
      >
        <span className="font-bold">+ Add New</span>
      </button>

      {/* Avatars - POSITIONING MODIFIED */}
      <button 
        className="flex ml-4 cursor-pointer sticky top-3/4 -translate-y-[150%] z-10 px-2 py-1 transition-colors"
        style={{ left: `${avatarLeftPosition}px` }}
        onClick={() => setIsAssigneeModalOpen(true)}
      >
        {/* <span className="mt-1 text-[12px] px-1">assigned to:</span> */}
        {teamMembers.map((member, index) => (
          <Avatar key={index} className="h-6 w-6 border-2 border-background">
            <AvatarImage
              src={member.avatar || "/placeholder.svg"}
              alt={member.name}
            />
            <AvatarFallback>{member.fallback}</AvatarFallback>
          </Avatar>
        ))}
      </button>
    </div>
    </>
  )
}