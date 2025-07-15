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
  await Promise.all(tabIds.map((tabId) => chrome.tabs.reload(tabId)));
}

/**
 * @param urls - urls of the tabs to reload
 * @returns void
 */

export async function reloadMultipleTabsByUrl(urls: string[]) {
  const tabs = await chrome.tabs.query({ url: urls });
  await Promise.all(
    tabs.map((tab) => (tab.id ? reloadTab(tab.id) : Promise.resolve()))
  );
}

/**
 * reloads all tabs
 */

export async function reloadAllTabs() {
  const tabs = await chrome.tabs.query({});

  await Promise.all(
    tabs.map((tab) => (tab.id ? reloadTab(tab.id) : Promise.resolve()))
  );
}
