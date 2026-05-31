import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

type UserInfo = {
  email?: string;
};

@Injectable()
export class GoogleOAuthService {
  private readonly scopes = [
    'openid',
    'email',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
  ].join(' ');

  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(
      this.config.get<string>('googleSiteKit.clientId') &&
        this.config.get<string>('googleSiteKit.clientSecret') &&
        this.config.get<string>('googleSiteKit.redirectUri'),
    );
  }

  getAuthUrl() {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Google OAuth is not configured. Set GOOGLE_SITE_KIT_CLIENT_ID, GOOGLE_SITE_KIT_CLIENT_SECRET, and GOOGLE_SITE_KIT_REDIRECT_URI in Backend .env',
      );
    }
    const clientId = this.config.get<string>('googleSiteKit.clientId')!;
    const redirectUri = this.config.get<string>('googleSiteKit.redirectUri')!;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: this.scopes,
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    const tokens = await this.postToken({
      code,
      grant_type: 'authorization_code',
    });
    const user = await this.fetchUserInfo(tokens.access_token);
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      email: user.email ?? 'Google account',
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const tokens = await this.postToken({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    return {
      accessToken: tokens.access_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };
  }

  private async postToken(body: Record<string, string>): Promise<TokenResponse> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Google OAuth is not configured');
    }
    const params = new URLSearchParams({
      client_id: this.config.get<string>('googleSiteKit.clientId')!,
      client_secret: this.config.get<string>('googleSiteKit.clientSecret')!,
      redirect_uri: this.config.get<string>('googleSiteKit.redirectUri')!,
      ...body,
    });
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = (await res.json()) as TokenResponse & { error?: string };
    if (!res.ok) {
      throw new BadRequestException(data.error ?? 'Google token exchange failed');
    }
    return data;
  }

  private async fetchUserInfo(accessToken: string): Promise<UserInfo> {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return {};
    return (await res.json()) as UserInfo;
  }
}
