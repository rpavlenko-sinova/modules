import { AuthService } from "./authServicePlasmo";


/**
 * Gets the user's Google OAuth token.
 */

export async function getAccessToken(): Promise<string> {
  const authService = AuthService.getInstance();
  return authService.getAccessToken();
}
