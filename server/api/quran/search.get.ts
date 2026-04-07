import { defineEventHandler, getQuery } from 'h3'

// Simple in-memory token cache
let cachedToken: string | null = null
let tokenExpiry = 0

async function getQuranToken(config: any): Promise<string | null> {
  // Return cached token if valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  try {
    // OAuth2 Client Credentials flow
    const response = await fetch('https://prelive-oauth2.quran.foundation/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.qfClientId}:${config.qfClientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=content',
    })

    if (!response.ok) {
      console.error('OAuth error:', await response.text())
      return null
    }

    const data = await response.json()
    cachedToken = data.access_token
    // Set expiry with 5-minute buffer
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000
    return cachedToken
  } catch (error) {
    console.error('Token fetch error:', error)
    return null
  }
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event).q as string

  if (!q || q.trim().length < 2) {
    return {
      results: [],
      error: 'Query too short (minimum 2 characters)',
    }
  }

  const config = useRuntimeConfig()

  try {
    // Get OAuth token
    const token = await getQuranToken(config)

    if (!token) {
      return {
        error: 'Authentication failed - check QF_CLIENT_ID and QF_CLIENT_SECRET',
        results: [],
      }
    }

    // Call Quran Foundation Search API
    const response = await fetch(
      `https://apis-prelive.quran.foundation/v1/search?q=${encodeURIComponent(q.trim())}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('QF API error:', errorText)
      return {
        error: `API error: ${response.status}`,
        results: [],
      }
    }

    const data = await response.json()

    return {
      results: data.results || [],
      total: data.total || 0,
      query: q.trim(),
    }
  } catch (error: any) {
    console.error('Search error:', error)
    return {
      error: error.message || 'Failed to search Quran',
      results: [],
      query: q.trim(),
    }
  }
})
