import { useRuntimeConfig } from '#imports'

type QfScope = 'content' | 'search'

const tokenCache: Partial<Record<QfScope, { token: string; expiresAt: number }>> = {}

interface TokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

export async function getQfAccessToken(scope: QfScope): Promise<string | null> {
  const config = useRuntimeConfig()
  const id = config.qfClientId as string | undefined
  const secret = config.qfClientSecret as string | undefined
  
  if (!id || !secret) {
    console.error('QF OAuth Error: Missing QF_CLIENT_ID or QF_CLIENT_SECRET')
    return null
  }

  const now = Date.now()
  const cached = tokenCache[scope]
  if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
    return cached.token
  }

  const tokenUrl =
    (config.qfOAuthTokenUrl as string | undefined) ||
    'https://prelive-oauth2.quran.foundation/oauth2/token'

  try {
    const response = await $fetch<TokenResponse>(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`
      },
      body: `grant_type=client_credentials&scope=${scope}`
    })

    if (response.error) {
      console.error('QF OAuth Error:', response.error, response.error_description)
      return null
    }

    if (!response.access_token) {
      console.error('QF OAuth Error: No access token in response')
      return null
    }

    tokenCache[scope] = {
      token: response.access_token,
      expiresAt: now + (response.expires_in || 3600) * 1000
    }
    return response.access_token
  } catch (e: any) {
    console.error('QF OAuth Error:', e?.message || e)
    if (e?.data) {
      console.error('QF OAuth Error Details:', JSON.stringify(e.data))
    }
    return null
  }
}

export async function qfFetchJson<T>(
  path: string,
  query?: Record<string, string | number | undefined>,
  scope: QfScope = 'content'
): Promise<T> {
  const config = useRuntimeConfig()
  const id = config.qfClientId as string | undefined
  const base = (config.qfApiBase as string | undefined) || 'https://apis-prelive.quran.foundation'
  const token = await getQfAccessToken(scope)
  
  if (!token || !id) {
    throw new Error('Quran Foundation authentication failed')
  }

  const url = new URL(path.startsWith('http') ? path : `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    }
  }

  return await $fetch<T>(url.toString(), {
    headers: {
      'x-auth-token': token,
      'x-client-id': id,
      Accept: 'application/json'
    }
  })
}
