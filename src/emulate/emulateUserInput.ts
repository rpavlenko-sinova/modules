/**
 * Emulates a user input on the given element.
 * @param element - The element to input on.
 * @param value - The value to input.
 * @param options - Options for input behavior
 */

const DEFAULT_DELAY_VALUE = 1000;
const DEFAULT_DELAY_MIN_MS = 1000;
const DEFAULT_DELAY_MAX_MS = 3000;

export function emulateUserInput(
  element: HTMLInputElement | string,
  value: string,
  options?: {
    delay?: "fixed" | "random" | undefined;
    delayValue?: number;
    delayMinMS?: number;
    delayMaxMS?: number;
    deletePreviousValue?: boolean;
  }
) {
  const getElement = (): HTMLInputElement => {
    if (typeof element === "string") {
      const currentElement: HTMLInputElement | null =
        document.querySelector(element);
      if (!currentElement) {
        throw new Error(`Element not found: ${element}`);
      }
      return currentElement;
    }
    return element;
  };

  const targetElement = getElement();

  if (options?.deletePreviousValue) {
    targetElement.value = "";
  }

  if (!options?.delay) {
    targetElement.value = value;
    return;
  }

  targetElement.value = "";

  let currentIndex = 0;

  const inputNextChar = () => {
    if (currentIndex < value.length) {
      const char = value[currentIndex];
      targetElement.value += char;
      currentIndex++;

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
        setTimeout(inputNextChar, delayMS);
      } else {
        inputNextChar();
      }
    }
  };

  inputNextChar();
}

/**
 * Emulates a user input on the given element asynchronously.
 * @param element - The element to input on.
 * @param value - The value to input.
 * @param options - Options for input behavior
 */

export async function emulateUserInputAsync(
  element: HTMLInputElement | string,
  value: string,
  options?: {
    delay?: "fixed" | "random" | undefined;
    delayValue?: number;
    delayMinMS?: number;
    delayMaxMS?: number;
    deletePreviousValue?: boolean;
  }
) {
  const getElement = (): HTMLInputElement => {
    if (typeof element === "string") {
      const currentElement: HTMLInputElement | null =
        document.querySelector(element);
      if (!currentElement) {
        throw new Error(`Element not found: ${element}`);
      }
      return currentElement;
    }
    return element;
  };

  const targetElement = getElement();

  if (options?.deletePreviousValue) {
    targetElement.value = "";
  }

  if (!options?.delay) {
    targetElement.value = value;
    return;
  }

  targetElement.value = "";

  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    targetElement.value += char;

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
  }
}
