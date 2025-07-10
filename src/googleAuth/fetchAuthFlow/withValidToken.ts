import { AuthService } from "./authServicePlasmo";

/**
 * Wraps a function with a valid Google OAuth token.
 */

export async function withValidToken<T>(
  fn: (token: string) => Promise<T>
): Promise<T> {
  const authService = AuthService.getInstance();
  const token = await authService.getAccessToken();
  return await fn(token);
}
