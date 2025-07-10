/**
 * @param tabId - id of the tab to reload
 * @returns void
 */

export async function reloadTab(tabId: number) {
  await chrome.tabs.reload(tabId);
}

/**
 * @param url - url of the tab to reload
 * @returns void
 */

export async function reloadTabByUrl(url: string) {
  const tabs = await chrome.tabs.query({ url });
  if (tabs.length > 0 && tabs[0].id != null) {
    await reloadTab(tabs[0].id);
  }
}

/**
 * @param tabIds - ids of the tabs to reload
 * @returns void
 */

export async function reloadTabsById(tabIds: number[]) {
  for (const tabId of tabIds) {
    await chrome.tabs.reload(tabId);
  }
}

/**
 * @param urls - urls of the tabs to reload
 * @returns void
 */

export async function reloadMultipleTabsByUrl(urls: string[]) {
  const tabs = await chrome.tabs.query({ url: urls });
  for (const tab of tabs) {
    if (tab.id != null) {
      await reloadTab(tab.id);
    }
  }
}

/**
 * reloads all tabs
 */

export async function reloadAllTabs() {
  const tabs = await chrome.tabs.query({});

  for (const tab of tabs) {
    if (tab.id != null) {
      try {
        await chrome.tabs.reload(tab.id);
      } catch (e) {
        console.warn(`Could not reload tab ${tab.id}`, e);
      }
    }
  }
}
