/**
 * @description switchOrCreateTab is a function that switches to an existing tab or creates a new one.
 * @param {string} url - The url of the tab to switch to or create.
 * @returns {Promise<void>} A promise that resolves when the tab is switched to or created.
 */

async function switchOrCreateTab(url: string) {
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find((tab) => tab.url === url)

    if (existingTab) {
      if (existingTab.active) {
        chrome.tabs.sendMessage(existingTab.id!, { type: "navigateNumbers" })
      } else {
        chrome.tabs.create({ url: url })
      }
    } else {
      chrome.tabs.create({ url: url })
    }
  })
}

export default switchOrCreateTab