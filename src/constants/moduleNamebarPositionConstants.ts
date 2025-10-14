// src/constants/moduleNamebarPositionConstants.ts

/**
 * Configuration constants for ModuleNamebar positioning
 */

// Offset decreases by 6px for each member removed from 5
export const OFFSET_STEP_PX = 6
export const BASE_OFFSET_PX = 18 // Offset for 5+ members

// Avatar offset decreases by 24px for each member removed
export const AVATAR_OFFSET_STEP = 24
export const BASE_AVATAR_OFFSET = 62 // Offset for 5+ members

/**
 * Calculate dynamic offset based on team member count
 * Offset decreases by 6px for each member removed from 5
 */
export function calculateDynamicOffsetPx(teamMemberCount: number): number {
  if (teamMemberCount >= 5) return BASE_OFFSET_PX
  if (teamMemberCount === 4) return BASE_OFFSET_PX - OFFSET_STEP_PX // 12
  if (teamMemberCount === 3) return BASE_OFFSET_PX - OFFSET_STEP_PX * 2 // 6
  if (teamMemberCount === 2) return BASE_OFFSET_PX - OFFSET_STEP_PX * 3 // 0
  return BASE_OFFSET_PX - OFFSET_STEP_PX * 4 // -6
}

/**
 * Calculate dynamic avatar offset based on team member count
 * Avatar offset decreases by 24px for each member removed
 */
export function calculateDynamicAvatarOffset(teamMemberCount: number): number {
  if (teamMemberCount >= 5) return BASE_AVATAR_OFFSET
  if (teamMemberCount === 4) return BASE_AVATAR_OFFSET - AVATAR_OFFSET_STEP // 38
  if (teamMemberCount === 3) return BASE_AVATAR_OFFSET - AVATAR_OFFSET_STEP * 2 // 14
  if (teamMemberCount === 2) return BASE_AVATAR_OFFSET - AVATAR_OFFSET_STEP * 3 // -10
  return BASE_AVATAR_OFFSET - AVATAR_OFFSET_STEP * 4 // -34
}