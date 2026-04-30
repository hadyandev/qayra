import { setCookie, sendRedirect, createError, getQuery } from 'h3'
import { getQfOAuthConfig, getQfEnvKey } from '~/server/utils/qfOAuthConfig'
import { buildAuthorizationUrl } from '~/server/utils/qfPkce'

function getEnvCookiePrefix(): string {
  return `qf_${getQfEnvKey()}_`
}

export default defineEventHandler(async (event) => {
  const config = getQfOAuthConfig()
  const envPrefix = getEnvCookiePrefix()
  
  const redirectUri = config.redirectUri
  if (!redirectUri) {
    throw createError({
      statusCode: 400,
      message: 'OAuth redirect URI not configured. Set QF_OAUTH_REDIRECT_URI in .env'
    })
  }
  
  const query = getQuery(event)
  const customRedirect = (query.redirect as string) || '/heatmap'
  
  const { url, state, codeVerifier } = buildAuthorizationUrl({
    redirectUri,
    authBaseUrl: config.authBaseUrl,
    clientId: config.clientId,
    scopes: config.scopes
  })
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 10
  }
  
  setCookie(event, `${envPrefix}oauth_state`, state, cookieOptions)
  setCookie(event, `${envPrefix}oauth_code_verifier`, codeVerifier, cookieOptions)
  setCookie(event, `${envPrefix}oauth_redirect_uri`, redirectUri, cookieOptions)
  setCookie(event, `${envPrefix}oauth_custom_redirect`, customRedirect, cookieOptions)
  
  return sendRedirect(event, url)
})
