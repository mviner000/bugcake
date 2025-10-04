// src/utils/formatUtils.ts

/**
 * Formats text with automatic numbering for each line
 * @param text - The input text with newlines
 * @returns Formatted text with "1.) ", "2.) ", etc.
 */
export function formatWithNumbering(text: string): string {
  const lines = text
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => line.trim());
  
  return lines
    .map((line, index) => `${index + 1}.) ${line}`)
    .join('\n');
}

/**
 * Formats text as a numbered list
 * @param text - The input text with newlines
 * @returns Formatted text with "1. ", "2. ", etc.
 */
export function formatToList(text: string): string {
  return text
    .split('\n')
    .map((line, index) => line.trim() ? `${index + 1}. ${line.trim()}` : '')
    .filter(line => line)
    .join('\n');
}