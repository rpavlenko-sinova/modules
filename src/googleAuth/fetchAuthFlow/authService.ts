interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const TOKEN_STORAGE_KEY = "auth_tokens";
const OAUTH_STATE_COOKIE_NAME = "oauth_state";

export class AuthService {
  private static instance: AuthService;
  private tokens: StoredTokens | null = null;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scope: string;

  private constructor(scope?: string) {
    this.clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
    this.clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
    this.redirectUri =
      process.env.GOOGLE_OAUTH_REDIRECT_URI ||
      "http://localhost:3000/auth/callback";
    this.scope =
      scope ||
      "email";

    if (!this.clientId || !this.clientSecret) {
      console.warn(
        "Google OAuth credentials not configured. Please set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET environment variables."
      );
    }

    this.loadTokens().catch(console.error);
  }

  static getInstance(scope?: string): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(scope);
    }
    return AuthService.instance;
  }

  private setSecureCookie(
    name: string,
    value: string,
    maxAgeSeconds: number = 300
  ): void {
    if (typeof document === "undefined") return;

    const cookieValue = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Strict; Secure; HttpOnly`;
    document.cookie = cookieValue;
  }

  private getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  private deleteCookie(name: string): void {
    if (typeof document === "undefined") return;

    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Strict; Secure; HttpOnly`;
  }

  private async loadTokens(): Promise<StoredTokens | null> {
    if (this.tokens) {
      return this.tokens;
    }

    try {
      // !!!IMPORTANT: This build uses localStorage to store tokens. Swap for something else in extensions
      const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedTokens) {
        return null;
      }

      const tokens = JSON.parse(storedTokens);
      this.tokens = tokens;
      return this.tokens;
    } catch (error) {
      console.error("Error loading tokens:", error);
      return null;
    }
  }

  private async saveTokens(tokens: StoredTokens): Promise<void> {
    this.tokens = tokens;
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error("Error saving tokens:", error);
    }
  }

  private async clearTokens(): Promise<void> {
    this.tokens = null;
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  async isLoggedIn(): Promise<boolean> {
    const tokens = await this.loadTokens();
    return !!tokens;
  }

  async getAccessToken(): Promise<string> {
    const tokens = await this.loadTokens();

    if (!tokens) {
      throw new Error("Not logged in");
    }

    if (this.isTokenExpired(tokens)) {
      try {
        return await this.refreshAccessToken(tokens.refreshToken);
      } catch (e) {
        console.log(
          `[${new Date().toISOString()}] Token refresh failed, reinitializing auth...`
        );
        return this.initializeAuth();
      }
    }

    return tokens.accessToken;
  }

  private isTokenExpired(tokens: StoredTokens): boolean {
    return Date.now() >= tokens.expiresAt;
  }

  async login(): Promise<string> {
    return this.initializeAuth();
  }

  private async initializeAuth(): Promise<string> {
    if (!this.clientId) {
      throw new Error("Google OAuth client ID not configured");
    }

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    // Generate a random state parameter for CSRF protection
    const state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    this.setSecureCookie(OAUTH_STATE_COOKIE_NAME, state, 300);

    authUrl.searchParams.append("client_id", this.clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("redirect_uri", this.redirectUri);
    authUrl.searchParams.append("scope", this.scope);
    authUrl.searchParams.append("prompt", "consent");
    authUrl.searchParams.append("state", state);

    if (typeof window !== "undefined") {
      window.location.href = authUrl.toString();
      throw new Error(
        "Redirect initiated. Handle token exchange on callback page."
      );
    }

    throw new Error("Authentication not supported in this environment");
  }

  async handleAuthCallback(code: string, state: string): Promise<string> {
    const storedState = this.getCookie(OAUTH_STATE_COOKIE_NAME);
    if (!storedState || state !== storedState) {
      throw new Error("Invalid state parameter - possible CSRF attack");
    }

    this.deleteCookie(OAUTH_STATE_COOKIE_NAME);

    return this.exchangeCodeForTokens(code);
  }

  private async exchangeCodeForTokens(code: string): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }

    const tokenUrl = "https://oauth2.googleapis.com/token";

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${errorText}`);
    }

    const tokenData: TokenResponse = await response.json();

    console.log("tokenData", tokenData);

    const tokens: StoredTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };

    await this.saveTokens(tokens);
    return tokenData.access_token;
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }

    const tokenUrl = "https://oauth2.googleapis.com/token";

    console.log(`[${new Date().toISOString()}] Refreshing access token...`);

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error(
        `[${new Date().toISOString()}] Refresh token failed with status: ${
          response.status
        }`
      );
      await this.clearTokens();
      throw new Error("Refresh token expired");
    }

    const tokenData: TokenResponse = await response.json();

    const tokens: StoredTokens = {
      accessToken: tokenData.access_token,
      refreshToken: refreshToken,
      expiresAt: Date.now() + tokenData.expires_in * 1000, // Convert to milliseconds
    };

    await this.saveTokens(tokens);
    return tokenData.access_token;
  }

  async revokeToken(): Promise<void> {
    const tokens = await this.loadTokens();
    if (!tokens) {
      return;
    }

    try {
      await fetch(
        `https://accounts.google.com/o/oauth2/revoke?token=${tokens.accessToken}`
      );
    } catch (error) {
      console.error("Error revoking token:", error);
    }

    await this.clearTokens();
  }

  private isBrowserEnvironment(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }
}
