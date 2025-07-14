/**
 * Switches to the tab with the given ID or URL.
 * @param tabId - The ID of the tab to switch to.
 * @param url - The URL of the tab to switch to.
 * @param byTimeCreated - The time of the tab to switch to. @default "newest"
 * @returns Whether the tab was switched to.
 */
export function switchToTab({
  tabId,
  url,
  byTimeCreated = "newest",
}: {
  tabId?: number;
  url?: string;
  byTimeCreated?: "oldest" | "newest" | "lastAccessed";
}) {
  if (!tabId && !url) {
    return false;
  }
  if (tabId) {
    chrome.tabs.update(tabId, { active: true });
    return true;
  } else if (url) {
    chrome.tabs.query({}, (tabs) => {
      const tabList = tabs.filter((tab) => tab.url === url);
      let existingTab;
      if (byTimeCreated === "oldest") {
        existingTab = tabList[0];
      } else if (byTimeCreated === "newest") {
        existingTab = tabList[tabList.length - 1];
      } else if (byTimeCreated === "lastAccessed") {
        // lastAccessed is from chrome 121+, which came out february 2025. Using fallback for older versions, if not available
        const hasLastAccessed = tabList.some((tab) => "lastAccessed" in tab);

        if (hasLastAccessed) {
          existingTab = tabList.sort(
            (a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0)
          )[0];
        } else {
          existingTab = tabList[tabList.length - 1];
        }
      }
      if (existingTab) {
        chrome.tabs.update(existingTab.id!, { active: true });
        return true;
      } else {
        return false;
      }
    });
  } else {
    return false;
  }
  return false;
}
