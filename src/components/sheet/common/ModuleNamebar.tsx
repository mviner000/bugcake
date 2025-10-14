// src/components/sheet/common/ModuleNamebar.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useRef } from "react"
import { AssigneeModal } from "./AssigneeModal"
import { RequestForModuleAccessButton } from "./RequestForModuleAccessButton"
import { RequestForModuleAccessModal } from "./RequestForModuleAccessModal"
import { Id } from "convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useModuleNamebarPositions } from "@/hooks/useModuleNamebarPositions"

interface TeamMember {
  name: string
  avatar: string
  fallback: string
  email?: string
}

interface ModuleNamebarProps {
  title: string
  bgColor: string
  textColor: string
  className?: string
  isChecked: boolean
  isIndeterminate: boolean
  onCheckboxChange: (checked: boolean) => void
  itemCount?: number 
  moduleId: Id<"modules"> 
  sheetId: Id<"sheets">
  // Props for conditional rendering
  currentUserRole?: "owner" | "qa_lead" | "qa_tester" | "viewer"
  currentUserModuleAccessStatus?: "approved" | "pending" | "declined" | "none"
  onAddClick?: () => void
  isCheckboxDisabled?: boolean
}

export function ModuleNamebar({
  title,
  bgColor,
  isChecked,
  isIndeterminate,
  onCheckboxChange,
  className = "",
  itemCount,
  moduleId,
  sheetId,
  currentUserRole,
  currentUserModuleAccessStatus,
  onAddClick,
  isCheckboxDisabled = false,
}: ModuleNamebarProps) {
  const titleButtonRef = useRef<HTMLButtonElement>(null)

  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)

  // Fetch module assignees dynamically
  const moduleAssignees = useQuery(api.myFunctions.getModuleAssignees, {
    moduleId: moduleId,
  })

  // Logic to determine if "Add New" button should be shown
  const shouldShowAddButton = (() => {
    if (currentUserRole === "owner" || currentUserRole === "qa_lead") {
      return true
    }
    
    if (currentUserRole === "qa_tester" && currentUserModuleAccessStatus === "approved") {
      return true
    }
    
    return false
  })()

  // Logic to determine if "Request Access" button should be shown
  const shouldShowRequestButton = (() => {
    if (currentUserRole === "qa_tester" && currentUserModuleAccessStatus !== "approved") {
      return true
    }
    
    return false
  })()

  // Use fetched assignees or show default placeholder
  const teamMembers: TeamMember[] = moduleAssignees && moduleAssignees.length > 0 
    ? moduleAssignees 
    : [{
        name: "No Assignees",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NA",
        fallback: "NA",
      }]

  // Calculate dynamic avatar width based on team member count
  const avatarTotalWidth = teamMembers.length * 30

  // Use the custom hook for position calculations
  const {
    avatarLeftPosition,
    addButtonLeftPosition,
    dynamicOffsetPx,
    dynamicAvatarOffset,
  } = useModuleNamebarPositions({
    teamMemberCount: teamMembers.length,
    titleButtonRef,
  })

  return (
    <>
    <AssigneeModal
      open={isAssigneeModalOpen}
      onOpenChange={setIsAssigneeModalOpen}
      moduleName={title}
      moduleId={moduleId} 
      sheetId={sheetId}
    />
    <RequestForModuleAccessModal
        open={isRequestModalOpen}
        onOpenChange={setIsRequestModalOpen}
        moduleName={title}
        moduleId={moduleId} 
        sheetId={sheetId}
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
          className="ml-[8px] appearance-none w-[13px] h-[13px] border-[0.5px] border-[#171717] rounded-[3px] checked:bg-blue-500 checked:border-blue-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          checked={isChecked}
          disabled={isCheckboxDisabled}
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

      {/* Conditionally render Add Button */}
      {shouldShowAddButton && (
        <button
          onClick={onAddClick}
          className="ml-4 cursor-pointer sticky top-3/4 -translate-y-[65%] z-10 border border-[#333333] text-[#333333] bg-transparent px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors"
          style={{ 
            lineHeight: "normal", 
            fontSize: "14px", 
            left: `calc(${addButtonLeftPosition}px - 28px)` 
          }}
        >
          <span className="font-bold">+ Add New</span>
        </button>
      )}

      {/* Conditionally render Request Button */}
      {shouldShowRequestButton && (
        <RequestForModuleAccessButton
          className="ml-4 sticky top-3/4 -translate-y-[65%] z-10"
          style={{
            left: `calc(${avatarLeftPosition}px + ${dynamicOffsetPx}px - ${avatarTotalWidth}px)`,
          }}
          onClick={() => setIsRequestModalOpen(true)}
        />
      )}

      <TooltipProvider>
        <button 
          className="flex ml-4 sticky top-3/4 -translate-y-[150%] z-10 px-2 py-1"
          style={{ left: `${avatarLeftPosition - dynamicAvatarOffset}px` }}
        >
          {!moduleAssignees ? (
            // Loading state
            <Avatar className="h-6 w-6 border-2 border-background animate-pulse">
              <AvatarFallback>...</AvatarFallback>
            </Avatar>
          ) : (
            <>
              {/* Show all if ≤ 5 members, otherwise only 4 + dropdown */}
              {(teamMembers.length <= 5 ? teamMembers : teamMembers.slice(0, 4)).map((member, index) => (
                <Tooltip key={index} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsAssigneeModalOpen(true)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarImage
                          src={member.avatar}
                          alt={member.name}
                        />
                        <AvatarFallback>{member.fallback}</AvatarFallback>
                      </Avatar>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="bg-white border border-gray-200 shadow-lg"
                  >
                    <div className="flex flex-col gap-1 py-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {member.name}
                      </p>
                      {member.email && (
                        <p className="text-xs text-gray-600">
                          {member.email}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Show dropdown button only when there are more than 5 members */}
              {teamMembers.length > 5 && (
                <button
                  onClick={() => {}}
                  className="border outline-black cursor-pointer flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ml-[2px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              )}
            </>
          )}
        </button>
      </TooltipProvider>


    </div>
    </>
  )
}