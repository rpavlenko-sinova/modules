import { awaitDOMElement } from "./awaitDOMElement";
import { generateUniqueSelector } from "./generateUniqueSelector";

/**
 * @param selectors - selector array for elements
 * @param maxRetries - optional. Default 5
 * @param retryIntervalMS - optional. Default 1000
 * @param innerTextOptions - optional. Array with possible variants of element inner text
 * @returns Returns all elements that can suit provided selector or empty array
 *
 */

export async function findFirstElement({
  selectors,
  maxRetries,
  retryIntervalMS,
  innerTextOptions,
  parentElement,
}: {
  selectors: string[];
  maxRetries?: number;
  retryIntervalMS?: number;
  innerTextOptions?: string[];
  parentElement?: HTMLElement | string;
}): Promise<{ element: Element; selector: string } | null> {
  const promises = selectors.map((selector) =>
    awaitDOMElement({
      selector,
      maxRetries,
      retryIntervalMS,
      parentElement,
    }).then((element) => (element ? { element, selector } : null))
  );

  const results = await Promise.allSettled(promises);

  const firstMatch = results.find(
    (result) => result.status === "fulfilled" && result.value !== null
  );

  if (firstMatch && firstMatch.status === "fulfilled") {
    return firstMatch.value;
  }

  if (innerTextOptions && innerTextOptions.length > 0) {
    const allElements = document.querySelectorAll("*");
    const arrayOfElements = Array.from(allElements);

    for (const text of innerTextOptions) {
      const element = arrayOfElements.find(
        (element) => element.textContent?.trim() === text
      );

      if (element) {
        const uniqueSelector = generateUniqueSelector(element);
        return {
          element,
          selector: uniqueSelector,
        };
      }
    }
  }

  return null;
}
