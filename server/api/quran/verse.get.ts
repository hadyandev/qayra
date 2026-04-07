import { defineEventHandler, getQuery } from 'h3'

// Token cache (shared with search)
declare global {
  var qfToken: string | null
  var qfTokenExpiry: number
}

async function getToken(config: any): Promise<string | null> {
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
  const key = getQuery(event).key as string

  if (!key) {
    return { error: 'Verse key is required', verse: null }
  }

  const config = useRuntimeConfig()

  try {
    const token = await getToken(config)

    if (!token) {
      return { error: 'Failed to authenticate', verse: null }
    }

    // Call Verses API
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
      const error = await response.text()
      console.error('Verse API error:', error)
      return { error: `Verse fetch failed: ${response.status}`, verse: null }
    }

    const data = await response.json()
    return { verse: data }
  } catch (error: any) {
    console.error('Verse error:', error)
    return { error: error.message || 'Failed to fetch verse', verse: null }
  }
})
