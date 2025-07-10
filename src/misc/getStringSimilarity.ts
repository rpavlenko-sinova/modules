/**
 * Returns number in range [0, 1] that represents the similarity of the length of the two strings.
 */
export function getLengthSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  const minLength = Math.min(str1.length, str2.length);
  return minLength / maxLength;
}

/**
 * Returns number in range [0, 1] that represents the similarity of the character distribution of the two strings.
 */
export function getCharacterDistributionSimilarity(
  str1: string,
  str2: string
): number {
  // Create character frequency maps
  const getFrequencyMap = (str: string) => {
    const map = new Map<string, number>();
    for (const char of str.toLowerCase()) {
      map.set(char, (map.get(char) || 0) + 1);
    }
    return map;
  };

  const freq1 = getFrequencyMap(str1);
  const freq2 = getFrequencyMap(str2);

  // Get all unique characters
  const allChars = new Set([...str1.toLowerCase(), ...str2.toLowerCase()]);

  // Compare frequencies
  let similarity = 0;
  allChars.forEach((char) => {
    const freq1Normalized = (freq1.get(char) || 0) / str1.length;
    const freq2Normalized = (freq2.get(char) || 0) / str2.length;
    similarity +=
      Math.min(freq1Normalized, freq2Normalized) /
      Math.max(freq1Normalized, freq2Normalized);
  });

  return similarity / allChars.size;
}
