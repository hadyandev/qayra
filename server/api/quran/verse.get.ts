import { defineEventHandler, getQuery } from 'h3'

// Reuse token from search endpoint (shared memory in same process)
// In production, use Redis or proper shared cache
declare global {
  var cachedQuranToken: string | null
  var tokenQuranExpiry: number
}

async function getQuranToken(config: any): Promise<string | null> {
  // Return cached token if valid
  if (global.cachedQuranToken && Date.now() < (global.tokenQuranExpiry || 0)) {
    return global.cachedQuranToken
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
    global.cachedQuranToken = data.access_token
    // Set expiry with 5-minute buffer
    global.tokenQuranExpiry = Date.now() + (data.expires_in - 300) * 1000
    return global.cachedQuranToken
  } catch (error) {
    console.error('Token fetch error:', error)
    return null
  }
}

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string

  if (!key) {
    return {
      error: 'Verse key is required',
      verse: null,
    }
  }

  const config = useRuntimeConfig()

  try {
    // Get OAuth token
    const token = await getQuranToken(config)

    if (!token) {
      return {
        error: 'Authentication failed - check QF_CLIENT_ID and QF_CLIENT_SECRET',
        verse: null,
      }
    }

    // Call Quran Foundation Verses API
    const response = await fetch(
      `https://apis-prelive.quran.foundation/v1/verses/by_key/${encodeURIComponent(key)}?language=en&translation=131`,
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
        verse: null,
      }
    }

    const data = await response.json()

    return {
      verse: data,
      key,
    }
  } catch (error: any) {
    console.error('Verse error:', error)
    return {
      error: error.message || 'Failed to fetch verse',
      verse: null,
      key,
    }
  }
})
