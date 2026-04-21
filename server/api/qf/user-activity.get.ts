import { getCookie } from 'h3'
import { getQfOAuthConfig, getQfEnvKey } from '../../utils/qfOAuthConfig'
import { getAccessToken, refreshQfToken } from '../../utils/qfTokenRefresh'
import { parseApiError, logQfError } from '../../utils/qfErrors'

export default defineEventHandler(async (event) => {
  const config = getQfOAuthConfig()
  const envPrefix = `qf_${getQfEnvKey()}_`
  
  // Get access token from cookie
  let accessToken = getCookie(event, `${envPrefix}access_token`)
  
  // Try to refresh if missing or expiring soon
  if (!accessToken) {
    const refreshToken = getCookie(event, `${envPrefix}refresh_token`)
    if (refreshToken) {
      try {
        const tokens = await refreshQfToken()
        accessToken = tokens.access_token
        
        // Update cookie
        setCookie(event, `${envPrefix}access_token`, tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: tokens.expires_in
        })
      } catch (err: any) {
        logQfError(err, { action: 'refresh', endpoint: '/auth/v1/activity-days' })
        return {
          authenticated: false,
          activities: [],
          error: 'Please log in to see your activity'
        }
      }
    }
  }
  
  if (!accessToken) {
    return {
      authenticated: false,
      activities: [],
      error: 'Not logged in. Sign in to see your QF activity.'
    }
  }
  
  // Get query params
  const query = getQuery(event)
  const from = (query.from as string) || '2025-01-01'
  const to = (query.to as string) || new Date().toISOString().split('T')[0]
  
  try {
    // Fetch from QF API
    const response: any = await $fetch(`${config.apiBaseUrl}/auth/v1/activity-days`, {
      method: 'GET',
      headers: {
        'x-auth-token': accessToken,
        'x-client-id': config.clientId
      },
      query: {
        from,
        to,
        first: 52
      }
    })
    
    const activities = (response.data || []).map((d: any) => ({
      date: d.date,
      count: d.secondsRead || 0,
      type: d.type
    }))
    
    return {
      authenticated: true,
      activities,
      error: null
    }
  } catch (err: any) {
    const parsed = parseApiError(err?.data || err, err.status || 0)
    logQfError(parsed, { endpoint: '/auth/v1/activity-days', action: 'api_call' })
    
    return {
      authenticated: false,
      activities: [],
      error: parsed.hint || 'Failed to fetch activity'
    }
  }
})