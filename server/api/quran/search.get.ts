import { defineEventHandler, getQuery } from 'h3'

// Token cache
let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getAuthToken(config: any) {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < tokenExpiry - 300000) {
    return cachedToken
  }

  try {
    // OAuth2 token endpoint
    const tokenResponse: any = await $fetch('https://prelive-oauth2.quran.foundation/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.qfClientId}:${config.qfClientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'content'
      }).toString()
    })

    cachedToken = tokenResponse.access_token
    tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000)
    
    return cachedToken
  } catch (error) {
    console.error('Token fetch error:', error)
    return null
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string

  if (!q || q.trim().length < 2) {
    return {
      error: 'Query must be at least 2 characters',
      results: []
    }
  }

  const config = useRuntimeConfig()
  
  // Get OAuth token
  const token = await getAuthToken(config)
  
  if (!token) {
    return {
      error: 'Authentication failed',
      results: []
    }
  }

  try {
    const response = await $fetch('https://apis-prelive.quran.foundation/search', {
      method: 'GET',
      headers: {
        'x-auth-token': token,
        'x-client-id': config.qfClientId,
        'Accept': 'application/json',
      },
      query: {
        q: q.trim(),
        limit: '10'
      }
    })

    return response
  } catch (error: any) {
    console.error('QF Search Error:', error)
    return {
      error: 'Failed to fetch from Quran Foundation',
      details: error.message || 'Unknown error',
      results: []
    }
  }
})
