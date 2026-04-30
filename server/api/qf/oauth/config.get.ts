import { getQfOAuthConfig } from '~/server/utils/qfOAuthConfig'

export default defineEventHandler(() => {
  const config = getQfOAuthConfig()

  return {
    env: config.env,
    authBaseUrl: config.authBaseUrl,
    apiBaseUrl: config.apiBaseUrl,
    redirectUri: config.redirectUri,
    scopes: config.scopes
  }
})
