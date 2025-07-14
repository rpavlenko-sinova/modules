/**
 * Truncates text to a specified length and adds an ellipsis if needed.
 * @param text - The text to truncate
 * @param maxLength - Maximum length of the truncated text (including ellipsis)
 * @param ellipsis - The ellipsis string to append (default: "...")
 * @returns The truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = "..."
): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncatedLength = maxLength - ellipsis.length;
  return text.slice(0, truncatedLength) + ellipsis;
}

/**
 * Truncates text to a specified length from the end (right side).
 * @param text - The text to truncate
 * @param maxLength - Maximum length of the truncated text (including ellipsis)
 * @param ellipsis - The ellipsis string to prepend (default: "...")
 * @returns The truncated text
 */
export function truncateTextFromEnd(
  text: string,
  maxLength: number,
  ellipsis: string = "..."
): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncatedLength = maxLength - ellipsis.length;
  return ellipsis + text.slice(-truncatedLength);
}
