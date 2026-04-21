import { readBody, getQuery, createError } from 'h3'
import { exchangeAuthorizationCode, decodeIdToken } from '~/server/utils/qfTokenExchange'
import { getQfOAuthConfig, getQfEnvKey } from '~/server/utils/qfOAuthConfig'

function getEnvCookiePrefix(): string {
  return `qf_${getQfEnvKey()}_`
}

export default defineEventHandler(async (event) => {
  const method = event.method
  
  // GET: Handle OAuth callback with authorization code
  if (method === 'GET') {
    const query = getQuery(event)
    const code = query.code as string | undefined
    const state = query.state as string | undefined
    const error = query.error as string | undefined
    const errorDescription = query.error_description as string | undefined
    
    // Check for OAuth errors
    if (error) {
      console.error('[QF OAuth] Callback error:', error, errorDescription)
      throw createError({
        statusCode: 400,
        message: errorDescription || error
      })
    }
    
    if (!code) {
      throw createError({
        statusCode: 400,
        message: 'Missing authorization code'
      })
    }
    
    // Get env prefix
    const envPrefix = getEnvCookiePrefix()
    
    // Validate state from cookie
    const storedState = getCookie(event, `${envPrefix}oauth_state`)
    if (!storedState || storedState !== state) {
      throw createError({
        statusCode: 400,
        message: 'Invalid state parameter - possible CSRF attack'
      })
    }
    
    // Get stored code verifier from cookie
    const codeVerifier = getCookie(event, `${envPrefix}oauth_code_verifier`)
    if (!codeVerifier) {
      throw createError({
        statusCode: 400,
        message: 'Missing PKCE code verifier'
      })
    }
    
    // Get stored redirect URI
    const redirectUri = getCookie(event, `${envPrefix}oauth_redirect_uri`)
    if (!redirectUri) {
      throw createError({
        statusCode: 400,
        message: 'Missing redirect URI'
      })
    }
    
    try {
      // Exchange code for tokens
      const tokens = await exchangeAuthorizationCode({
        code,
        redirectUri,
        codeVerifier
      })
      
      // Decode ID token to get user info
      let userId = null
      let email = null
      if (tokens.id_token) {
        const payload = decodeIdToken(tokens.id_token)
        if (payload) {
          userId = payload.sub
          email = payload.email
        }
      }
      
      // Store tokens in secure httpOnly cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: tokens.expires_in
      }
      
      setCookie(event, `${envPrefix}access_token`, tokens.access_token, {
        ...cookieOptions,
        maxAge: tokens.expires_in
      })
      
      if (tokens.refresh_token) {
        setCookie(event, `${envPrefix}refresh_token`, tokens.refresh_token, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
      }
      
      // Clear OAuth temp cookies
      deleteCookie(event, `${envPrefix}oauth_state`)
      deleteCookie(event, `${envPrefix}oauth_code_verifier`)
      deleteCookie(event, `${envPrefix}oauth_redirect_uri`)
      
      // Return success with user info (tokens are in cookies)
      return {
        success: true,
        user: {
          id: userId,
          email
        },
        scope: tokens.scope
      }
    } catch (err: any) {
      console.error('[QF OAuth] Token exchange failed:', err.message)
      throw createError({
        statusCode: 400,
        message: 'Failed to complete OAuth login'
      })
    }
  }
  
  // POST: Initiate OAuth flow (generate auth URL)
  if (method === 'POST') {
    const body = await readBody(event)
    const redirectUri = body.redirectUri as string | undefined
    
    if (!redirectUri) {
      throw createError({
        statusCode: 400,
        message: 'Missing redirectUri'
      })
    }
    
    // Import PKCE helper
    const { buildAuthorizationUrl } = await import('~/server/utils/qfPkce')
    const config = getQfOAuthConfig()
    const envPrefix = getEnvCookiePrefix()
    
    // Generate auth URL
    const { url, state, nonce, codeVerifier } = buildAuthorizationUrl({
      redirectUri,
      authBaseUrl: config.authBaseUrl,
      clientId: config.clientId
    })
    
    // Store in cookies (httpOnly for security)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 10 // 10 minutes
    }
    
    setCookie(event, `${envPrefix}oauth_state`, state, cookieOptions)
    setCookie(event, `${envPrefix}oauth_code_verifier`, codeVerifier, cookieOptions)
    setCookie(event, `${envPrefix}oauth_redirect_uri`, redirectUri, cookieOptions)
    
    // Return the auth URL to redirect to
    return { url }
  }
  
  throw createError({
    statusCode: 405,
    message: 'Method not allowed'
  })
})