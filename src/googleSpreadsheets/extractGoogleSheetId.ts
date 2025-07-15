/**
 * Extracts the Google Sheet ID from a Google Sheet URL.
 * @param url - The URL of the Google Sheet.
 * @returns The Google Sheet ID.
 */

export function extractGoogleSheetId(url: string): string | null {
  if (typeof url !== "string") {
    return null;
  }

  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}
