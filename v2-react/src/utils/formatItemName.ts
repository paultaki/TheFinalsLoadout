/**
 * Formats item names by removing underscores and properly capitalizing
 * @param name - The item name with underscores
 * @returns The formatted item name
 */
export function formatItemName(name: string): string {
  if (!name) return '';
  return name.replace(/_/g, ' ');
}