/**
 * @param selector - selector of element
 * @param maxRetries - optional. Default 5
 * @param retryIntervalMS - optional. Default 1000
 * @param parentElement - optional. Selector or reference of parent element. If not defined, or not available on init - used "*" selector
 * @returns Returns first element with provided selector or null if not found
 *
 */

export const awaitDOMElement = ({
  selector,
  maxRetries,
  retryIntervalMS,
  parentElement,
}: {
  selector: string;
  maxRetries?: number;
  retryIntervalMS?: number;
  parentElement?: HTMLElement | string;
}) =>
  new Promise<HTMLElement | null>((resolve) => {
    if (!selector) {
      resolve(null);
      return;
    }

    const getParentElement = (): HTMLElement | null => {
      if (!parentElement) {
        return document.body;
      }

      if (typeof parentElement === "string") {
        return document.querySelector<HTMLElement>(parentElement);
      }

      return parentElement;
    };

    const queryElement = (): HTMLElement | null => {
      const parent = getParentElement();
      if (!parent) {
        return document.querySelector<HTMLElement>(selector);
      }
      return parent.querySelector<HTMLElement>(selector);
    };

    const element = queryElement();

    if (element) {
      resolve(element);
      return;
    }

    let attempt = 0;
    const maxAttempts = maxRetries || 5;
    const retryInterval = retryIntervalMS || 1000;
    const interval = window.setInterval(() => {
      const element = queryElement();
      if (element) {
        resolve(element);
        clearInterval(interval);
      }
      if (attempt === maxAttempts) {
        resolve(null);
        clearInterval(interval);
      }
      attempt = attempt + 1;
    }, retryInterval);
  });
