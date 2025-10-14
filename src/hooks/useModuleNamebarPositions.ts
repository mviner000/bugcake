// src/hooks/useModuleNamebarPositions.ts

import { useState, useEffect, RefObject } from "react"
import { calculateDynamicOffsetPx, calculateDynamicAvatarOffset } from "@/constants/moduleNamebarPositionConstants"

interface PositionOffsets {
  avatarLeftPosition: number
  addButtonLeftPosition: number
  dynamicOffsetPx: number
  dynamicAvatarOffset: number
}

interface UseModuleNamebarPositionsProps {
  teamMemberCount: number
  titleButtonRef: RefObject<HTMLButtonElement | null>
}

export function useModuleNamebarPositions({
  teamMemberCount,
  titleButtonRef,
}: UseModuleNamebarPositionsProps): PositionOffsets {
  const [avatarLeftPosition, setAvatarLeftPosition] = useState(1000)
  const [addButtonLeftPosition, setAddButtonLeftPosition] = useState(112)

  // Calculate offsets based on team member count
  const dynamicOffsetPx = calculateDynamicOffsetPx(teamMemberCount)
  const dynamicAvatarOffset = calculateDynamicAvatarOffset(teamMemberCount)

  useEffect(() => {
    const updatePosition = () => {
      const screenWidth = window.innerWidth
      const titleButtonWidth = titleButtonRef.current?.offsetWidth || 0
      
      const calculatedAvatarPosition = screenWidth - 120
      const calculatedAddButtonPosition = 60 + titleButtonWidth 

      setAvatarLeftPosition(calculatedAvatarPosition)
      setAddButtonLeftPosition(calculatedAddButtonPosition)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)
    
    const resizeObserver = new ResizeObserver(updatePosition)
    if (titleButtonRef.current) {
      resizeObserver.observe(titleButtonRef.current)
    }
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
      resizeObserver.disconnect()
    }
  }, [titleButtonRef])

  return {
    avatarLeftPosition,
    addButtonLeftPosition,
    dynamicOffsetPx,
    dynamicAvatarOffset,
  }
}