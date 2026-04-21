import { getCookie, setCookie, getQuery, createError } from 'h3'
import { getQfOAuthConfig, getQfEnvKey } from '~/server/utils/qfOAuthConfig'
import { buildAuthorizationUrl } from '~/server/utils/qfPkce'

function getEnvCookiePrefix(): string {
  return `qf_${getQfEnvKey()}_`
}

export default defineEventHandler(async (event) => {
  const config = getQfOAuthConfig()
  const envPrefix = getEnvCookiePrefix()
  
  // Get redirect URI from config
  const redirectUri = config.redirectUri
  if (!redirectUri) {
    throw createError({
      statusCode: 400,
      message: 'OAuth redirect URI not configured. Set QF_OAUTH_REDIRECT_URI in .env'
    })
  }
  
  // Generate auth URL with PKCE
  const { url, state, codeVerifier } = buildAuthorizationUrl({
    redirectUri,
    authBaseUrl: config.authBaseUrl,
    clientId: config.clientId,
    scopes: 'openid offline_access activity_day streak'
  })
  
  // Store state and code verifier in cookies for validation on callback
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
  
  // Redirect to QF OAuth
  return sendRedirect(event, url)
})
