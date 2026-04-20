import { getCookie, setCookie, deleteCookie } from 'h3'
import { getQfOAuthConfig, getQfEnvKey } from './qfOAuthConfig'
import { $fetch } from 'ofetch'
import { parseOAuthError, logQfError } from './qfErrors'

export interface RefreshedTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

// In-memory refresh lock to prevent stampede
let refreshing: Promise<RefreshedTokens> | null = null

/**
 * Get environment-specific cookie prefix
 * Ensures tokens from different environments don't mix
 */
function getEnvCookiePrefix(): string {
  const envKey = getQfEnvKey()
  return `qf_${envKey}_`
}

/**
 * Refresh QF access token using refresh_token
 * 
 * Uses environment-specific cookie names to prevent cross-env token mixing
 * Implements refresh stampede prevention - only one refresh runs at a time
 * 
 * @param event - H3 event for cookie access
 * @returns New tokens or throws error
 */
export async function refreshQfToken(
  event?: { context: { qfTokens?: { refreshToken?: string } } }
): Promise<RefreshedTokens> {
  const config = getQfOAuthConfig()
  const { authBaseUrl, clientId, clientSecret } = config
  const isConfidential = !config.isPublicClient && !!clientSecret
  const envPrefix = getEnvCookiePrefix()
  
  // Get refresh token from event context or cookie
  let refreshToken = event?.context?.qfTokens?.refreshToken
  if (!refreshToken && event) {
    refreshToken = getCookie(event, `${envPrefix}refresh_token`) || undefined
  }
  
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  
  // Build request
  const params = new URLSearchParams()
  params.set('grant_type', 'refresh_token')
  params.set('refresh_token', refreshToken)
  
  if (!isConfidential) {
    params.set('client_id', clientId)
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  
  if (isConfidential && clientSecret) {
    headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
  }
  
  // Prevent stampede - wait for existing refresh
  if (refreshing) {
    try {
      return await refreshing
    } catch {
      // Previous failed, try again
    }
  }
  
  // Start new refresh
  refreshing = (async () => {
    try {
      const response = await $fetch<RefreshedTokens>(`${authBaseUrl}/oauth2/token`, {
        method: 'POST',
        headers,
        body: params.toString()
      })
      
      if (!response.access_token) {
        throw new Error('No access token in refresh response')
      }
      
      return response
    } catch (error: any) {
      const parsed = parseOAuthError(error?.data || error)
      logQfError(parsed, { action: 'refresh' })
      throw new Error(parsed.hint || 'Failed to refresh access token')
    } finally {
      refreshing = null
    }
  })()
  
  return refreshing
}

/**
 * Store QF tokens in secure httpOnly cookies
 * Uses environment-specific prefixes to prevent cross-env token mixing
 * 
 * @param event - H3 event
 * @param tokens - Token response from exchange
 */
export function storeQfTokens(event: any, tokens: {
  access_token: string
  refresh_token?: string
  expires_in: number
}) {
  const envPrefix = getEnvCookiePrefix()
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/'
  }
  
  setCookie(event, `${envPrefix}access_token`, tokens.access_token, {
    ...cookieOptions,
    maxAge: tokens.expires_in
  })
  
  if (tokens.refresh_token) {
    setCookie(event, `${envPrefix}refresh_token`, tokens.refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30
    })
  }
}

/**
 * Clear QF tokens (logout)
 * 
 * @param event - H3 event
 */
export function clearQfTokens(event: any) {
  const envPrefix = getEnvCookiePrefix()
  deleteCookie(event, `${envPrefix}access_token`)
  deleteCookie(event, `${envPrefix}refresh_token`)
}

/**
 * Check if user has valid QF token
 * 
 * @param event - H3 event
 * @returns boolean
 */
export function hasQfToken(event: any): boolean {
  const envPrefix = getEnvCookiePrefix()
  const accessToken = getCookie(event, `${envPrefix}access_token`)
  return !!accessToken
}

/**
 * Get current access token from cookie
 * 
 * @param event - H3 event
 * @returns string | undefined
 */
export function getAccessToken(event: any): string | undefined {
  const envPrefix = getEnvCookiePrefix()
  return getCookie(event, `${envPrefix}access_token`)
}
