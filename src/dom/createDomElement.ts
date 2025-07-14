/**
 * Creates a new DOM element with the given tag, attributes, and children.
 * @param tag - The tag of the element to create.
 * @param attributes - The attributes of the element to create.
 * @param parent - The parent element to append the new element to.
 * @param children - The children of the element to create.
 * @returns The created element.
 */

export function createDomElement(
  tag: string,
  attributes: Record<string, string>,
  parent?: HTMLElement,
  children?: string[] | HTMLElement[]
) {
  const element = document.createElement(tag);
  let parentElement = parent;
  if (parent) {
    parentElement = parent;
  } else {
    parentElement = document.body;
  }
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  for (const child of children ?? []) {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }
  parentElement.appendChild(element);
  return element;
}
