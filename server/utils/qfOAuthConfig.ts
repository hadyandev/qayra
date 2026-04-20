import { useRuntimeConfig } from '#imports'

export interface QfOAuthConfig {
  env: 'prelive' | 'production'
  clientId: string
  clientSecret: string | undefined
  authBaseUrl: string
  apiBaseUrl: string
  redirectUri: string | undefined
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

/**
 * Get Quran Foundation OAuth2 configuration
 * 
 * Reads from environment:
 * - QF_CLIENT_ID (required)
 * - QF_CLIENT_SECRET (optional - only for confidential clients)
 * - QF_ENV (optional): "prelive" | "production" (default: "prelive")
 * 
 * @throws Error if QF_CLIENT_ID is missing
 */
export function getQfOAuthConfig(): QfOAuthConfig {
  const config = useRuntimeConfig()
  const clientId = config.qfClientId as string | undefined
  const clientSecret = config.qfClientSecret as string | undefined
  const redirectUri = config.qfOAuthRedirectUri as string | undefined

  if (!clientId) {
    throw new Error(
      'Missing Quran Foundation API credentials. Request access: https://api-docs.quran.foundation/request-access'
    )
  }

  const env = (process.env.QF_ENV === 'production' ? 'production' : 'prelive') as 'prelive' | 'production'
  
  const envConfig = QF_CONFIG_MAP[env]
  const isPublicClient = !clientSecret

  return {
    env,
    clientId,
    clientSecret,
    redirectUri,
    authBaseUrl: envConfig.authBaseUrl,
    apiBaseUrl: envConfig.apiBaseUrl,
    isPublicClient
  }
}

/**
 * Check if currently using prelive environment
 */
export function isPrelive(): boolean {
  return process.env.QF_ENV !== 'production'
}

/**
 * Get environment key for isolation purposes
 * Returns 'prelive' or 'production' - used for cookie/session prefixes
 */
export function getQfEnvKey(): 'prelive' | 'production' {
  return process.env.QF_ENV === 'production' ? 'production' : 'prelive'
}

/**
 * Validate QF credentials are configured
 * Returns undefined if valid, error message if invalid
 */
export function validateQfCredentials(): string | undefined {
  const clientId = process.env.QF_CLIENT_ID
  if (!clientId) {
    return 'QF_CLIENT_ID is required'
  }
  return undefined
}