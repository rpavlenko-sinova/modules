/**
 * Creates a new tab with the given URL.
 * @param url - The URL to open in the new tab.
 * @param active - Whether the tab should be active. @default true
 * @param pinned - Whether the tab should be pinned. @default false
 * @returns The ID of the created tab.
 */
export function createTab({
  url,
  active = true,
  pinned = false,
}: {
  url: string;
  active?: boolean;
  pinned?: boolean;
}) {
  chrome.tabs.create({ url, active, pinned });
}
