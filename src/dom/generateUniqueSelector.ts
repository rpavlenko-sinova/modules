/**
 * @param element - reference to the Element
 * @returns Returns string selector for passed element
 *
 */

export function generateUniqueSelector(element: Element): string {
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  if (element.classList.length > 0) {
    const classSelector = Array.from(element.classList)
      .map((cls) => `.${CSS.escape(cls)}`)
      .join("");

    if (document.querySelectorAll(classSelector).length === 1) {
      return classSelector;
    }
  }

  let currentElem: Element | null = element;
  const path: string[] = [];

  while (
    currentElem &&
    currentElem !== document.body &&
    currentElem !== document.documentElement
  ) {
    let selector = currentElem.tagName.toLowerCase();

    if (currentElem.parentElement) {
      const siblings = Array.from(currentElem.parentElement.children).filter(
        (child) => child.tagName === currentElem?.tagName
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(currentElem) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    currentElem = currentElem.parentElement;
  }

  return path.join(" > ");
}
