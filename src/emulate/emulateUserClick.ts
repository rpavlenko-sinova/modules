/**
 * Emulates a user click on the given element.
 * @param element - The element to click on.
 * @param options - Options for click behavior
 */

const DEFAULT_DELAY_VALUE = 1000;
const DEFAULT_DELAY_MIN_MS = 1000;
const DEFAULT_DELAY_MAX_MS = 3000;

export function emulateUserClick(
  element: HTMLElement | string,
  options?: {
    delay?: "fixed" | "random" | undefined;
    delayValue?: number;
    delayMinMS?: number;
    delayMaxMS?: number;
  }
) {
  const getElement = (): HTMLElement => {
    if (typeof element === "string") {
      const currentElement: HTMLElement | null =
        document.querySelector(element);
      if (!currentElement) {
        throw new Error(`Element not found: ${element}`);
      }
      return currentElement;
    }
    return element;
  };

  const targetElement = getElement();

  if (!options?.delay) {
    targetElement.click();
    return;
  }

  // Handle delay logic with setTimeout for sync version
  let delayMS: number;

  if (options.delay === "fixed") {
    delayMS = options.delayValue || DEFAULT_DELAY_VALUE;
  } else if (options.delay === "random") {
    const min = options.delayMinMS || DEFAULT_DELAY_MIN_MS;
    const max = options.delayMaxMS || DEFAULT_DELAY_MAX_MS;
    delayMS = Math.random() * (max - min) + min;
  } else {
    delayMS = 0;
  }

  if (delayMS > 0) {
    setTimeout(() => {
      targetElement.click();
    }, delayMS);
  } else {
    targetElement.click();
  }
}

export async function emulateUserClickAsync(
  element: HTMLElement | string,
  options?: {
    delay?: "fixed" | "random" | undefined;
    delayValue?: number;
    delayMinMS?: number;
    delayMaxMS?: number;
  }
) {
  const getElement = (): HTMLElement => {
    if (typeof element === "string") {
      const currentElement: HTMLElement | null =
        document.querySelector(element);
      if (!currentElement) {
        throw new Error(`Element not found: ${element}`);
      }
      return currentElement;
    }
    return element;
  };

  const targetElement = getElement();

  if (!options?.delay) {
    targetElement.click();
    return;
  }

  let delayMS: number;

  if (options.delay === "fixed") {
    delayMS = options.delayValue || DEFAULT_DELAY_VALUE;
  } else if (options.delay === "random") {
    const min = options.delayMinMS || DEFAULT_DELAY_MIN_MS;
    const max = options.delayMaxMS || DEFAULT_DELAY_MAX_MS;
    delayMS = Math.random() * (max - min) + min;
  } else {
    delayMS = 0;
  }

  if (delayMS > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMS));
  }

  targetElement.click();
}
