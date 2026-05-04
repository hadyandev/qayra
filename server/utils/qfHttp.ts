import { useRuntimeConfig } from '#imports'

type QfScope = 'content' | 'search' | 'user' | 'streak' | 'bookmark' | 'goal' | 'reading_session' | 'activity_day'

const tokenCache: Partial<Record<QfScope, { token: string; expiresAt: number }>> = {}

interface TokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

async function getTokenWithCredentials(
  clientId: string,
  clientSecret: string,
  tokenUrl: string,
  oauthScope: string
): Promise<string | null> {
  try {
    const response = await $fetch<TokenResponse>(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: `grant_type=client_credentials&scope=${oauthScope}`
    })

    if (response.error) {
      console.error('[QF OAuth] Error:', response.error, response.error_description)
      return null
    }

    if (!response.access_token) {
      console.error('[QF OAuth] No access token in response')
      return null
    }

    return response.access_token
  } catch (e: any) {
    console.error('[QF OAuth] Exception:', e?.message || e)
    return null
  }
}

function oauthScopeFor(qfScope: QfScope): string {
  switch (qfScope) {
    case 'user': return 'note'
    case 'search': return 'search'
    case 'streak': return 'streak'
    case 'bookmark': return 'bookmark'
    case 'goal': return 'goal'
    case 'reading_session': return 'reading_session'
    case 'activity_day': return 'activity_day'
    default: return 'content'
  }
}

function isUserScope(scope: QfScope): boolean {
  return scope === 'user' || scope === 'streak' || scope === 'bookmark' ||
         scope === 'goal' || scope === 'reading_session' || scope === 'activity_day'
}

export async function getQfAccessToken(scope: QfScope): Promise<string | null> {
  const config = useRuntimeConfig()
  const now = Date.now()
  const cached = tokenCache[scope]
  if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
    return cached.token
  }

  let clientId: string
  let clientSecret: string
  let tokenUrl: string

  if (isUserScope(scope)) {
    clientId = config.qfClientId as string
    clientSecret = config.qfClientSecret as string
    tokenUrl = config.qfOAuthTokenUrl as string
    if (!clientId || !clientSecret) {
      console.error('[QF OAuth] Missing QF_CLIENT_ID or QF_CLIENT_SECRET')
      return null
    }
  } else {
    clientId = config.qfContentClientId as string || config.qfClientId as string
    clientSecret = config.qfContentClientSecret as string || config.qfClientSecret as string
    tokenUrl = config.qfContentOAuthTokenUrl as string || config.qfOAuthTokenUrl as string
    if (!clientId || !clientSecret) {
      console.error('[QF OAuth] Missing QF_CONTENT_CLIENT_ID (fallback: QF_CLIENT_ID) or QF_CONTENT_CLIENT_SECRET (fallback: QF_CLIENT_SECRET)')
      return null
    }
  }

  const oauthScope = oauthScopeFor(scope)
  const token = await getTokenWithCredentials(clientId, clientSecret, tokenUrl, oauthScope)

  if (token) {
    tokenCache[scope] = {
      token,
      expiresAt: now + 3600 * 1000
    }
  }

  return token
}

export async function qfFetchJson<T>(
  path: string,
  query?: Record<string, string | number | undefined>,
  scope: QfScope = 'content'
): Promise<T> {
  const config = useRuntimeConfig()
  const contentBase = config.qfApiBase as string || 'https://apis.quran.foundation'
  const userBase = config.qfUserApiBase as string || 'https://apis-prelive.quran.foundation'

  const clientId = isUserScope(scope)
    ? (config.qfClientId as string)
    : (config.qfContentClientId as string || config.qfClientId as string)

  const token = await getQfAccessToken(scope)

  if (!token || !clientId) {
    throw new Error('Quran Foundation authentication failed')
  }

  const base = isUserScope(scope) ? userBase : contentBase

  const cleanBase = base.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  const url = new URL(path.startsWith('http') ? path : cleanBase + '/' + cleanPath)

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    }
  }

  return await $fetch<T>(url.toString(), {
    headers: {
      'x-auth-token': token,
      'x-client-id': clientId,
      Accept: 'application/json'
    }
  })
}
