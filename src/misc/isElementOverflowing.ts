/**
 * Checks if a DOM element is overflowing its container.
 * @param element - The element to check for overflow
 * @param container - The container element (defaults to element's parent)
 * @param direction - The direction to check for overflow ('horizontal', 'vertical', or 'both')
 * @returns An object indicating overflow status in each direction
 */
export function isElementOverflowing(
  element: HTMLElement,
  container?: HTMLElement,
  direction: "horizontal" | "vertical" | "both" = "both"
): {
  horizontal: boolean;
  vertical: boolean;
  isOverflowing: boolean;
} {
  const targetContainer = container || element.parentElement;

  if (!targetContainer) {
    return {
      horizontal: false,
      vertical: false,
      isOverflowing: false,
    };
  }

  const elementRect = element.getBoundingClientRect();
  const containerRect = targetContainer.getBoundingClientRect();

  const horizontalOverflow =
    elementRect.left < containerRect.left ||
    elementRect.right > containerRect.right;

  const verticalOverflow =
    elementRect.top < containerRect.top ||
    elementRect.bottom > containerRect.bottom;

  const isOverflowing =
    (direction === "horizontal" && horizontalOverflow) ||
    (direction === "vertical" && verticalOverflow) ||
    (direction === "both" && (horizontalOverflow || verticalOverflow));

  return {
    horizontal: horizontalOverflow,
    vertical: verticalOverflow,
    isOverflowing,
  };
}
