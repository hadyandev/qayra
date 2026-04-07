import { defineEventHandler, getQuery } from 'h3'

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(config: any): Promise<string | null> {
  const now = Date.now()
  
  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && cachedToken.expiresAt > now + 5 * 60 * 1000) {
    return cachedToken.token
  }

  try {
    const basicAuth = Buffer.from(`${config.qfClientId}:${config.qfClientSecret}`).toString('base64')
    
    const response: any = await $fetch('https://prelive-oauth2.quran.foundation/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'search'  // FIXED: use 'search' scope instead of 'content'
      }).toString(),
      ignoreResponseContentType: true
    })

    if (response.access_token) {
      cachedToken = {
        token: response.access_token,
        expiresAt: now + (response.expires_in || 3600) * 1000
      }
      return response.access_token
    }
    
    return null
  } catch (error: any) {
    console.error('OAuth Error:', error.message || error)
    return null
  }
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event).q as string
  const config = useRuntimeConfig()

  if (!q) {
    return { error: 'Query parameter "q" is required', results: [] }
  }

  try {
    const token = await getAccessToken(config)
    
    if (!token) {
      return { error: 'Failed to authenticate with Quran Foundation API', results: [] }
    }

    // FIXED: Use correct headers for Search API
    const response: any = await $fetch(`https://apis-prelive.quran.foundation/search/v1/search`, {
      method: 'GET',
      headers: {
        'x-auth-token': token,      // JWT access token
        'x-client-id': config.qfClientId,  // Client ID
        'Accept': 'application/json'
      },
      query: { query: q },
      ignoreResponseContentType: true
    })

    return { results: response.results || response, error: null }
    
  } catch (error: any) {
    console.error('Search API Error:', error.message || error)
    return { 
      error: error.message || 'Search failed',
      errorDetails: error.response?.statusText || error.statusMessage,
      results: [] 
    }
  }
})
