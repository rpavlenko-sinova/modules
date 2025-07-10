// Whole purpose is being able to await the storage operations.

/**
 * @description getFromExtLocalStorage is a function that gets a value from the extension's local storage asynchronously.
 * @param {string} key - The key of the value to get.
 * @returns {Promise<{ success: boolean; value?: string }>} A promise that resolves to the value.
 */

export const getFromExtLocalStorage = (
  key: string
): Promise<{ success: boolean; value?: string }> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve({ success: true, value: result[key] });
      }
    });
  });
};

/**
 * @description setToExtLocalStorage is a function that sets a value to the extension's local storage asynchronously.
 * @param {string} key - The key of the value to set.
 * @param {string} value - The value to set.
 * @returns {Promise<{ success: boolean }>} A promise that resolves to the success of the operation.
 */

export const setToExtLocalStorage = (
  key: string,
  value: string
): Promise<{ success: boolean }> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve({ success: true });
      }
    });
  });
};
