/**
 * @description findRelevantTab is a function that finds the most relevant tab based on the url pattern.
 * @param {string} urlPattern - The url pattern to find the tab by.
 * @param {boolean} preferActive - Whether to prefer the active tab. @default true
 * @returns {Promise<chrome.tabs.Tab | null>} A promise that resolves to the tab.
 */

function findRelevantTab({
  urlPattern,
  preferActive = true,
}: {
  urlPattern: string
  preferActive?: boolean
}): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: urlPattern }, (tabs) => {
      if (tabs.length === 0) return resolve(null)

      let tab: chrome.tabs.Tab | undefined

      if (preferActive) {
        tab = tabs.find((t) => t.active)
      }

      if (!tab) {
        tab = tabs.reduce((latest, t) =>
          (t.id ?? 0) > (latest.id ?? 0) ? t : latest
        )
      }

      resolve(tab ?? null)
    })
  })
}
