import type { QfScope } from '../tools/types.js';

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

const tokenCache: Map<QfScope, CachedToken> = new Map();

const config = {
  clientId: process.env.QF_CLIENT_ID,
  clientSecret: process.env.QF_CLIENT_SECRET,
  tokenUrl: process.env.QF_OAUTH_TOKEN_URL || 'https://prelive-oauth2.quran.foundation/oauth2/token',
};

export function getAuthConfig() {
  return config;
}

export async function getAccessToken(scope: QfScope): Promise<string | null> {
  if (!config.clientId || !config.clientSecret) {
    console.error('QF OAuth Error: Missing QF_CLIENT_ID or QF_CLIENT_SECRET');
    return null;
  }

  const now = Date.now();
  const cached = tokenCache.get(scope);
  if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
    return cached.token;
  }

  try {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: `grant_type=client_credentials&scope=${scope}`
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('QF OAuth Error:', response.status, errorBody);
      return cached?.token || null;
    }

    const data: TokenResponse = await response.json();

    if (data.error) {
      console.error('QF OAuth Error:', data.error, data.error_description);
      return cached?.token || null;
    }

    if (!data.access_token) {
      console.error('QF OAuth Error: No access token in response');
      return cached?.token || null;
    }

    tokenCache.set(scope, {
      token: data.access_token,
      expiresAt: now + (data.expires_in || 3600) * 1000
    });

    return data.access_token;
  } catch (e) {
    console.error('QF OAuth Error:', e);
    return cached?.token || null;
  }
}

export async function getAllTokens(): Promise<Record<QfScope, string | null>> {
  const [content, search, user] = await Promise.all([
    getAccessToken('content'),
    getAccessToken('search'),
    getAccessToken('user')
  ]);
  return { content, search, user };
}

export function clearTokenCache(): void {
  tokenCache.clear();
}
