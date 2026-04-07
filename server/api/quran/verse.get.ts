import { defineEventHandler, getQuery } from 'h3'

// Token cache  
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(config: any): Promise<string | null> {
  const now = Date.now()
  
  // Return cached token if still valid
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
        scope: 'content'  // Content API uses 'content' scope
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
  const key = getQuery(event).key as string
  const config = useRuntimeConfig()

  if (!key) {
    return { error: 'Verse key is required', verse: null }
  }

  try {
    const token = await getAccessToken(config)
    
    if (!token) {
      return { error: 'Failed to authenticate with Quran Foundation API', verse: null }
    }

    // Content API uses different headers
    const response: any = await $fetch(`https://apis-prelive.quran.foundation/api/v4/verses/by_key/${key}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // Content API uses Bearer token
        'Accept': 'application/json'
      },
      query: {
        language: 'en',
        include_translation: 'true'
      },
      ignoreResponseContentType: true
    })

    return { verse: response, error: null }
    
  } catch (error: any) {
    console.error('Verse API Error:', error.message || error)
    return { 
      error: error.message || 'Failed to fetch verse',
      verse: null 
    }
  }
})
