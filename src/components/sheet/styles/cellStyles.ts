// src/components/sheet/common/styles/cellStyles.ts

/**
 * Centralized cell style constants for table components
 * These constants ensure consistent styling across all test case tables
 */

export const CELL_BASE = "border border-gray-300 px-3 py-2 text-sm text-gray-900";
export const CELL_CHECKBOX = "border border-gray-300 px-2 py-2 text-center";
export const CELL_WITH_WRAP = `${CELL_BASE} whitespace-pre-wrap`;
export const CELL_WORKFLOW = "border border-gray-300 px-3 py-2";

/**
 * Additional cell style variants for future use
 */
export const CELL_CENTERED = `${CELL_BASE} text-center`;
export const CELL_RIGHT_ALIGN = `${CELL_BASE} text-right`;
export const CELL_BOLD = `${CELL_BASE} font-semibold`;