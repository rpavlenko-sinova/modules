export async function checkAndClearToken() {
  try {
    await new Promise((resolve, reject) => {
      chrome.identity.clearAllCachedAuthTokens(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(null)
        }
      })
    })
  } catch (error) {
    console.error('Error clearing tokens:', error)
  }
}