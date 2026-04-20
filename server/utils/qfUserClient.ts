import { $fetch } from 'ofetch'
import { getQfOAuthConfig } from './qfOAuthConfig'
import { exchangeRefreshToken, type TokenResponse } from './qfTokenExchange'
import { parseApiError, logQfError, requiresReAuth, isRetryable } from './qfErrors'

declare module 'h3' {
  interface H3Event {
    context: {
      qfTokens?: {
        accessToken: string
        refreshToken?: string
        expiresAt?: number
      }
    }
  }
}

export interface QfApiOptions {
  scope?: 'content' | 'user' | 'activity_day' | 'streak' | 'bookmark' | 'goal' | 'reading_session'
}

let cachedRefreshToken: string | undefined
let cachedAccessToken: string | undefined
let tokenExpiresAt: number | undefined

/**
 * Get QF access token from cookies or cache
 */
function getAccessToken(event?: { context: { qfTokens?: { accessToken: string; refreshToken?: string } } }): string | undefined {
  // If we have event context with tokens, use those
  if (event?.context?.qfTokens?.accessToken) {
    return event.context.qfTokens.accessToken
  }
  
  // Otherwise use module-level cache
  return cachedAccessToken
}

/**
 * Get QF refresh token from cookies or cache
 */
function getRefreshToken(event?: { context: { qfTokens?: { accessToken: string; refreshToken?: string } } }): string | undefined {
  if (event?.context?.qfTokens?.refreshToken) {
    return event.context.qfTokens.refreshToken
  }
  return cachedRefreshToken
}

/**
 * Set token cache (called after OAuth login)
 */
export function setTokenCache(accessToken: string, refreshToken?: string, expiresIn?: number) {
  cachedAccessToken = accessToken
  cachedRefreshToken = refreshToken
  tokenExpiresAt = expiresIn ? Date.now() + (expiresIn * 1000) : undefined
}

/**
 * Clear token cache (called on logout)
 */
export function clearTokenCache() {
  cachedAccessToken = undefined
  cachedRefreshToken = undefined
  tokenExpiresAt = undefined
}

/**
 * Check if token is about to expire (within 5 minutes)
 */
function isTokenExpiringSoon(): boolean {
  if (!tokenExpiresAt) return false
  return Date.now() > tokenExpiresAt - (5 * 60 * 1000)
}

/**
 * Authenticated QF API client
 * 
 * Automatically handles:
 * - Adding x-auth-token and x-client-id headers
 * - Targeting correct API base URL
 * - Token refresh on 401
 * 
 * @param path - API path (e.g., '/auth/v1/activity-days')
 * @param options - Fetch options
 * @param event - Optional H3 event for cookie access
 * 
 * @returns Response from QF API
 */
export async function qfUserFetch<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    query?: Record<string, string | number | undefined>
    body?: unknown
    headers?: Record<string, string>
  } = {},
  event?: { context: { qfTokens?: { accessToken: string; refreshToken?: string } } }
): Promise<T> {
  const config = getQfOAuthConfig()
  let accessToken = getAccessToken(event)
  
  // Check if token needs refresh
  if (!accessToken || isTokenExpiringSoon()) {
    const refreshToken = getRefreshToken(event)
    if (refreshToken) {
      try {
        const tokens = await exchangeRefreshToken(refreshToken)
        accessToken = tokens.access_token
        setTokenCache(tokens.access_token, tokens.refresh_token, tokens.expires_in)
      } catch (err) {
        // Refresh failed - clear cache and let request fail
        clearTokenCache()
        accessToken = undefined
      }
    }
  }
  
  if (!accessToken) {
    throw new Error('No QF access token. User may not be logged in.')
  }
  
  // Build URL
  const baseUrl = config.apiBaseUrl
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`
  
  // Build headers
  const headers: Record<string, string> = {
    'x-auth-token': accessToken,
    'x-client-id': config.clientId,
    ...options.headers
  }
  
  // Make request
  try {
    return await $fetch<T>(url, {
      method: options.method || 'GET',
      query: options.query,
      body: options.body,
      headers
    })
  } catch (error: any) {
    const status = error.status || error.response?.status || 0
    const errorData = error.data || error.response?.data || {}
    
    // Handle 401 - try refreshing token once
    if (status === 401 && !options._retried) {
      const refreshToken = getRefreshToken(event)
      if (refreshToken) {
        try {
          const tokens: TokenResponse = await exchangeRefreshToken(refreshToken)
          setTokenCache(tokens.access_token, tokens.refresh_token, tokens.expires_in)
          
          // Retry with new token
          return await qfUserFetch<T>(path, {
            ...options,
            _retried: true
          }, event)
        } catch (refreshErr) {
          clearTokenCache()
          const parsed = parseApiError({ message: 'Session expired' }, 401)
          logQfError(parsed, { endpoint: path, action: 'api_call' })
          throw new Error('Session expired. Please log in again.')
        }
      }
    }
    
    // Parse and log error safely
    const parsed = parseApiError(errorData, status)
    logQfError(parsed, { endpoint: path, action: 'api_call' })
    
    // Throw actionable error
    if (requiresReAuth(parsed)) {
      throw new Error('Session expired. Please log in again.')
    }
    
    throw new Error(parsed.hint || 'API request failed')
  }
}

// Internal flag to prevent infinite retry loops
declare module 'h3' {
  interface H3Event {
    _qfRetried?: boolean
  }
}

/**
 * Simplified QF User API call
 * 
 * Usage:
 *   const activities = await qfUserApi<Activity[]>('/auth/v1/activity-days', {
 *     query: { from: '2025-01-01', to: '2025-04-01' }
 *   })
 */
export async function qfUserApi<T>(
  endpoint: string,
  fetchOptions: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    query?: Record<string, string | number | undefined>
    body?: unknown
  } = {}
): Promise<T> {
  return qfUserFetch<T>(endpoint, fetchOptions)
}

/**
 * Get user's activity days from QF
 * 
 * @param from - Start date (YYYY-MM-DD)
 * @param to - End date (YYYY-MM-DD)
 * @param type - Activity type: 'QURAN' | 'LESSON' | 'QURAN_READING_PROGRAM'
 */
export async function getUserActivityDays(
  from?: string,
  to?: string,
  type?: 'QURAN' | 'LESSON' | 'QURAN_READING_PROGRAM'
) {
  const query: Record<string, string | number | undefined> = {
    from: from || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: to || new Date().toISOString().split('T')[0],
    first: 20
  }
  
  if (type) {
    query.type = type
  }
  
  return qfUserApi<{
    success: boolean
    data: Array<{
      id: string
      date: string
      progress: number
      type: string
      secondsRead?: number
      ranges?: string[]
    }>
  }>('/auth/v1/activity-days', { query })
}

/**
 * Get user's streaks from QF
 */
export async function getUserStreaks() {
  return qfUserApi<{
    success: boolean
    data: {
      currentStreak: number
      longestStreak: number
      lastActivityDate: string
    }
  }>('/auth/v1/streaks')
}

/**
 * Get user's bookmarks from QF
 */
export async function getUserBookmarks(first: number = 20) {
  return qfUserApi<{
    success: boolean
    data: Array<{
      id: string
      verseKey: string
      createdAt: string
    }>
  }>('/auth/v1/bookmarks', { query: { first } })
}