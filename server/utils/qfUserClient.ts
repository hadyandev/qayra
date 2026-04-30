import { $fetch } from 'ofetch'
import { getCookie, setCookie, type H3Event } from 'h3'
import { getQfOAuthConfig, getQfEnvKey } from './qfOAuthConfig'
import { refreshQfToken } from './qfTokenRefresh'
import { parseApiError, logQfError, requiresReAuth } from './qfErrors'

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

type QfRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  query?: Record<string, string | number | undefined>
  body?: unknown
  headers?: Record<string, string>
  retried?: boolean
}

/**
 * Get environment-specific cookie prefix
 */
function getEnvCookiePrefix(): string {
  return `qf_${getQfEnvKey()}_`
}

/**
 * Get QF access token from request context or secure cookie
 */
function getAccessToken(event: H3Event): string | undefined {
  return event.context.qfTokens?.accessToken || getCookie(event, `${getEnvCookiePrefix()}access_token`) || undefined
}

/**
 * Get QF refresh token from request context or secure cookie
 */
function getRefreshToken(event: H3Event): string | undefined {
  return event.context.qfTokens?.refreshToken || getCookie(event, `${getEnvCookiePrefix()}refresh_token`) || undefined
}

/**
 * Store refreshed tokens in context and secure cookies
 */
function storeRefreshedTokens(event: H3Event, tokens: { access_token: string; refresh_token?: string; expires_in: number }) {
  const envPrefix = getEnvCookiePrefix()
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/'
  }

  event.context.qfTokens = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || getRefreshToken(event),
    expiresAt: Date.now() + tokens.expires_in * 1000
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
 * Check if token is about to expire (within 5 minutes)
 */
function isTokenExpiringSoon(event: H3Event): boolean {
  const expiresAt = event.context.qfTokens?.expiresAt
  if (!expiresAt) return false
  return Date.now() > expiresAt - (5 * 60 * 1000)
}

async function refreshAccessToken(event: H3Event): Promise<string | undefined> {
  if (!getRefreshToken(event)) return undefined

  const tokens = await refreshQfToken(event)
  storeRefreshedTokens(event, tokens)
  return tokens.access_token
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
  options: QfRequestOptions = {},
  event?: H3Event
): Promise<T> {
  if (!event) {
    throw new Error('No request context. User API calls require a logged-in QF session.')
  }

  const config = getQfOAuthConfig()
  let accessToken = getAccessToken(event)
  
  // Check if token needs refresh
  if (!accessToken || isTokenExpiringSoon(event)) {
    try {
      accessToken = await refreshAccessToken(event)
    } catch {
      accessToken = undefined
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
    if (status === 401 && !options.retried && getRefreshToken(event)) {
      try {
        await refreshAccessToken(event)
      } catch {
        const parsed = parseApiError({ message: 'Session expired' }, 401)
        logQfError(parsed, { endpoint: path, action: 'api_call' })
        throw new Error('Session expired. Please log in again.')
      }

      return await qfUserFetch<T>(path, {
        ...options,
        retried: true
      }, event)
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
  } = {},
  event?: H3Event
): Promise<T> {
  return qfUserFetch<T>(endpoint, fetchOptions, event)
}

/**
 * Get user's activity days from QF
 * 
 * @param from - Start date (YYYY-MM-DD)
 * @param to - End date (YYYY-MM-DD)
 * @param type - Activity type: 'QURAN' | 'LESSON' | 'QURAN_READING_PROGRAM'
 */
export async function getUserActivityDays(
  event: H3Event,
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
  }>('/auth/v1/activity-days', { query }, event)
}

/**
 * Get user's streaks from QF
 */
export async function getUserStreaks(event: H3Event) {
  return qfUserApi<{
    success: boolean
    data: {
      currentStreak: number
      longestStreak: number
      lastActivityDate: string
    }
  }>('/auth/v1/streaks', {}, event)
}

/**
 * Get user's bookmarks from QF
 */
export async function getUserBookmarks(event: H3Event, first: number = 20) {
  return qfUserApi<{
    success: boolean
    data: Array<{
      id: string
      verseKey: string
      createdAt: string
    }>
  }>('/auth/v1/bookmarks', { query: { first } }, event)
}
