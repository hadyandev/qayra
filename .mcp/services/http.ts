import { getAccessToken } from './auth.js';
import type { QfScope } from '../tools/types.js';

export interface HttpClientOptions {
  scope: QfScope;
  retries?: number;
  retryDelay?: number;
}

const defaultRetryDelay = 1000;
const maxRetries = 2;

export async function httpFetch<T>(
  path: string,
  query?: Record<string, string | number | undefined>,
  options: HttpClientOptions = { scope: 'content' }
): Promise<{ data: T | null; error: string | null }> {
  const { scope, retries = maxRetries, retryDelay = defaultRetryDelay } = options;
  const base = process.env.QF_API_BASE || 'https://apis-prelive.quran.foundation';
  const clientId = process.env.QF_CLIENT_ID;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const token = await getAccessToken(scope);
      if (!token || !clientId) {
        return { data: null, error: 'Quran Foundation authentication failed' };
      }

      let urlStr = path.startsWith('http') 
        ? path 
        : `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

      if (query) {
        const url = new URL(urlStr);
        for (const [k, v] of Object.entries(query)) {
          if (v !== undefined && v !== '') {
            url.searchParams.set(k, String(v));
          }
        }
        urlStr = url.toString();
      }

      const response = await fetch(urlStr, {
        headers: {
          'x-auth-token': token,
          'x-client-id': clientId,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401 && attempt < retries) {
          const { clearTokenCache } = await import('./auth.js');
          clearTokenCache();
          await new Promise(r => setTimeout(r, retryDelay * Math.pow(2, attempt)));
          continue;
        }
        return { 
          data: null, 
          error: `API Error ${response.status}: ${errorText.slice(0, 200)}` 
        };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (e) {
      lastError = e as Error;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, retryDelay * Math.pow(2, attempt)));
      }
    }
  }

  return { data: null, error: lastError?.message || 'Request failed after retries' };
}

export async function httpFetchWithAuth(
  path: string,
  query?: Record<string, string | number | undefined>,
  scope: QfScope = 'content'
) {
  return httpFetch(path, query, { scope });
}
