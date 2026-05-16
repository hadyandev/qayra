import { useRuntimeConfig } from '#imports'

export interface QfOAuthConfig {
  env: 'prelive' | 'production'
  clientId: string
  clientSecret: string | undefined
  authBaseUrl: string
  apiBaseUrl: string
  redirectUri: string | undefined
  scopes: string | undefined
  isPublicClient: boolean
}

const QF_CONFIG_MAP = {
  prelive: {
    authBaseUrl: 'https://prelive-oauth2.quran.foundation',
    apiBaseUrl: 'https://apis-prelive.quran.foundation'
  },
  production: {
    authBaseUrl: 'https://oauth2.quran.foundation',
    apiBaseUrl: 'https://apis.quran.foundation'
  }
} as const

function getUserEnv(): 'prelive' | 'production' {
  const config = useRuntimeConfig()
  const env = (config.qfUserEnv as string | undefined) || process.env.QF_USER_ENV || process.env.QF_ENV
  return env === 'production' || env === 'live' ? 'production' : 'prelive'
}

/**
 * Get Quran Foundation OAuth2 configuration
 * 
 * Uses QF_CLIENT_ID / QF_CLIENT_SECRET for User API OAuth.
 * Content API uses separate QF_CONTENT_CLIENT_ID / QF_CONTENT_CLIENT_SECRET
 * configured in qfHttp.ts.
 * 
 * @throws Error if QF_CLIENT_ID is missing
 */
export function getQfOAuthConfig(): QfOAuthConfig {
  const config = useRuntimeConfig()
  const clientId = config.qfClientId as string | undefined
  const clientSecret = config.qfClientSecret as string | undefined
  const redirectUri = config.qfOAuthRedirectUri as string | undefined
  const scopes = config.qfOAuthScopes as string | undefined
  const apiBaseUrl = config.qfUserApiBase as string | undefined
  
  const defaultScopes = 'openid offline_access activity_day streak bookmark'

  if (!clientId) {
    throw new Error(
      'Missing Quran Foundation API credentials. Request access: https://api-docs.quran.foundation/request-access'
    )
  }

  const env = getUserEnv()
  const envConfig = QF_CONFIG_MAP[env]
  const isPublicClient = !clientSecret

  return {
    env,
    clientId,
    clientSecret,
    redirectUri,
    scopes: scopes || defaultScopes,
    authBaseUrl: envConfig.authBaseUrl,
    apiBaseUrl: apiBaseUrl || envConfig.apiBaseUrl,
    isPublicClient
  }
}

export function isPrelive(): boolean {
  return getUserEnv() === 'prelive'
}

export function getQfEnvKey(): 'prelive' | 'production' {
  return getUserEnv()
}

export function validateQfCredentials(): string | undefined {
  const config = useRuntimeConfig()
  const clientId = config.qfClientId as string | undefined
  if (!clientId) {
    return 'QF_CLIENT_ID is required'
  }
  return undefined
}
