import { checkAndClearToken } from "./checkAndClearToken";

export async function getAccessToken(
  scopes: string[]
): Promise<chrome.identity.GetAuthTokenResult> {
  await checkAndClearToken();

  const token = await chrome.identity.getAuthToken({
    interactive: true,
    scopes,
  });
  if (!token) {
    throw new Error("No token received");
  }
  return token;
}
