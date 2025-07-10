import { Storage } from "@plasmohq/storage";

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

export class AuthService {
  private static instance: AuthService;
  private tokens: StoredTokens | null = null;
  private storage: Storage;
  private scope: string;

  private constructor(scope?: string) {
    this.storage = new Storage();
    this.scope = scope || "email";
    this.loadTokens().catch(console.error);
  }

  static getInstance(scope?: string): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(scope);
    }
    return AuthService.instance;
  }

  private async loadTokens(): Promise<StoredTokens | null> {
    if (this.tokens) {
      return this.tokens;
    }

    const tokens = await this.storage.get(TOKEN_STORAGE_KEY);
    if (typeof tokens !== "object") {
      return null;
    }
    this.tokens = tokens || null;
    return this.tokens;
  }

  private async saveTokens(tokens: StoredTokens): Promise<void> {
    this.tokens = tokens;
    await this.storage.set(TOKEN_STORAGE_KEY, tokens);
  }

  private async clearTokens(): Promise<void> {
    this.tokens = null;
    await this.storage.remove(TOKEN_STORAGE_KEY);
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
    const redirectUrl = chrome.identity.getRedirectURL();
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    console.log("process.env", process.env);

    console.log("Environment check:", {
      clientId: process.env.PLASMO_PUBLIC_OAUTH_CLIENT_ID,
      env: process.env.NODE_ENV,
    });

    authUrl.searchParams.append(
      "client_id",
      process.env.PLASMO_PUBLIC_OAUTH_CLIENT_ID || ""
    );
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("redirect_uri", redirectUrl);
    authUrl.searchParams.append("scope", this.scope);
    authUrl.searchParams.append("prompt", "consent");

    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true,
    });

    if (!responseUrl) {
      throw new Error("Authentication failed");
    }

    const url = new URL(responseUrl);
    const code = url.searchParams.get("code");

    if (!code) {
      throw new Error("No authorization code received");
    }

    return this.exchangeCodeForTokens(code);
  }

  private async exchangeCodeForTokens(code: string): Promise<string> {
    const redirectUrl = chrome.identity.getRedirectURL();
    const tokenUrl = "https://oauth2.googleapis.com/token";

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.PLASMO_PUBLIC_OAUTH_CLIENT_ID || "",
        client_secret: process.env.PLASMO_PUBLIC_OAUTH_CLIENT_SECRET || "",
        redirect_uri: redirectUrl,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokenData: TokenResponse = await response.json();

    console.log("tokenData", tokenData);

    const tokens: StoredTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_in,
    };

    await this.saveTokens(tokens);
    return tokenData.access_token;
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const tokenUrl = "https://oauth2.googleapis.com/token";

    console.log(`[${new Date().toISOString()}] Refreshing access token...`);

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.PLASMO_PUBLIC_OAUTH_CLIENT_ID || "",
        client_secret: process.env.PLASMO_PUBLIC_OAUTH_CLIENT_SECRET || "",
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
      expiresAt: tokenData.expires_in,
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
}
