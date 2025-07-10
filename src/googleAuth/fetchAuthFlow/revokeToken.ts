import { AuthService } from "./authServicePlasmo";

/**
 * Revokes the user's Google OAuth token.
 */

export async function revokeToken(): Promise<void> {
  const authService = AuthService.getInstance();
  await authService.revokeToken();
}
