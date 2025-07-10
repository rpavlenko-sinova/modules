import { checkAndClearToken } from "./checkAndClearToken";

export async function getAccessToken(scopes: string[]): Promise<string> {
  await checkAndClearToken();

  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(
      {
        interactive: true,
        scopes,
      },
      async (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!token) {
          reject(new Error("No token received"));
          return;
        }
        if (token.token) {
          resolve(token.token);
        } else {
          reject(new Error("No token received"));
        }
      }
    );
  });
}
