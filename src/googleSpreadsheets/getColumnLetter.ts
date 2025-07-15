/**
 * Converts a column key to Excel-style column letter (A, B, C, AA, AB, etc.)
 * @param headers - Array of column headers from the spreadsheet
 * @param key - The column key/header to convert
 * @returns Excel-style column letter
 * @throws Error if the column key is not found in headers
 */

const ASCII_UPPERCASE_A = 65; // ASCII code for 'A'
const ALPHABET_SIZE = 26; // Number of letters in the English alphabet

export function getColumnLetter(headers: string[], key: string): string {
  const index = headers.findIndex((header) => header === key);
  if (index === -1) throw new Error(`Column "${key}" not found in header`);
  let letter = "";
  let temp = index;
  while (temp >= 0) {
    letter =
      String.fromCharCode(ASCII_UPPERCASE_A + (temp % ALPHABET_SIZE)) + letter;
    temp = Math.floor(temp / ALPHABET_SIZE) - 1;
  }
  return letter;
}
