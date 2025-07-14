/**
 * @description isValidUrl is a function that validates if a string is a valid URL.
 * @param {string} url - The string to validate as a URL.
 * @returns {boolean} Returns true if the string is a valid URL, false otherwise.
 */

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
