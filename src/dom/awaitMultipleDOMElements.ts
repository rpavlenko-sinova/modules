/**
 * @param selector - selector for elements
 * @param maxRetries - optional. Default 5
 * @param retryIntervalMS - optional. Default 1000
 * @returns Returns all elements that can suit provided selector or empty array
 *
 */

export const awaitMultipleDOMElements = ({
  selector,
  maxRetries,
  retryIntervalMS,
  parentElement,
}: {
  selector: string;
  maxRetries?: number;
  retryIntervalMS?: number;
  parentElement?: string;
}) =>
  new Promise<HTMLElement[]>((resolve) => {
    if (!selector) {
      resolve([]);
      return;
    }

    let elements;
    let parent: Element | null = null;
    if (parentElement) {
      if (typeof parentElement === "string") {
        parent = document.querySelector(parentElement);
      } else if (typeof parentElement === "object") {
        parent = parentElement as Element;
        elements = Array.from(parent.querySelectorAll<HTMLElement>(selector));
      }
    } else {
      elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    }

    if (elements && elements.length > 0) {
      resolve(elements);
      return;
    }

    const maxAttempts = maxRetries || 5;
    const retryInterval = retryIntervalMS || 1000;

    let attempt = 0;
    const interval = window.setInterval(() => {
      let elements;
      if (parent) {
        elements = Array.from(parent.querySelectorAll<HTMLElement>(selector));
      } else {
        elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
      }

      if (elements.length > 0) {
        resolve(elements);
        clearInterval(interval);
      }

      if (attempt === maxAttempts) {
        resolve([]);
        clearInterval(interval);
      }

      attempt = attempt + 1;
    }, retryInterval);
  });
