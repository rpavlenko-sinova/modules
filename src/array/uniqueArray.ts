/**
 * Removes duplicate elements from an array while preserving order
 * @param array - The input array
 * @returns A new array with unique elements
 */
export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Removes duplicate objects from an array based on a key function
 * @param array - The input array of objects
 * @param keyFn - Function to extract the key for comparison
 * @returns A new array with unique objects based on the key
 */
export function uniqueArrayBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Removes duplicate objects from an array based on multiple key functions
 * @param array - The input array of objects
 * @param keyFns - Array of functions to extract keys for comparison
 * @returns A new array with unique objects based on all keys
 */
export function uniqueArrayByMultiple<T>(
  array: T[],
  keyFns: ((item: T) => any)[]
): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    const keys = keyFns.map((fn) => fn(item));
    const keyString = JSON.stringify(keys);
    if (seen.has(keyString)) {
      return false;
    }
    seen.add(keyString);
    return true;
  });
}
