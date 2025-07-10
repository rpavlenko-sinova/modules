import { getAccessToken } from "./getAccessToken";
import { triggerGoogleLogin } from "./triggerGoogleLogin";

export async function checkUserAuthentication(scopes: string[]) {
  try {
    const token = await getAccessToken(scopes);

    if (!token) {
      throw new Error("No token received");
    }

    return true;
  } catch {
    try {
      const loginResult = await triggerGoogleLogin(scopes);
      return loginResult;
    } catch {
      return false;
    }
  }
}
