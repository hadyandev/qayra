import { defineEventHandler, getQuery } from 'h3'

// Token cache
declare global {
  var qfToken: string | null
  var qfTokenExpiry: number
}

async function getToken(config: any): Promise<string | null> {
  // Return cached token if still valid
  if (global.qfToken && Date.now() < (global.qfTokenExpiry || 0)) {
    return global.qfToken
  }

  try {
    const response = await fetch('https://prelive-oauth2.quran.foundation/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.qfClientId}:${config.qfClientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=content',
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OAuth error:', error)
      return null
    }

    const data = await response.json()
    global.qfToken = data.access_token
    global.qfTokenExpiry = Date.now() + ((data.expires_in - 300) * 1000)
    return global.qfToken
  } catch (error) {
    console.error('Token error:', error)
    return null
  }
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event).q as string

  if (!q || q.trim().length < 2) {
    return { error: 'Query must be at least 2 characters', results: [] }
  }

  const config = useRuntimeConfig()

  try {
    const token = await getToken(config)

    if (!token) {
      return { error: 'Failed to authenticate with Quran Foundation', results: [] }
    }

    // Call Search API v1
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
      const error = await response.text()
      console.error('Search API error:', error)
      return { error: `Search failed: ${response.status}`, results: [] }
    }

    const data = await response.json()
    return { results: data.results || [] }
  } catch (error: any) {
    console.error('Search error:', error)
    return { error: error.message || 'Search failed', results: [] }
  }
})
