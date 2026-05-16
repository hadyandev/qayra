type QfEnv = 'prelive' | 'production'

function normalizeQfEnv(value?: string): QfEnv {
  return value === 'production' || value === 'live' ? 'production' : 'prelive'
}

const qfUserEnv = normalizeQfEnv(process.env.QF_USER_ENV || process.env.QF_ENV)
const qfContentEnv = normalizeQfEnv(process.env.QF_CONTENT_ENV || 'production')

const qfConfigMap: Record<QfEnv, { apiBase: string; oauthTokenUrl: string }> = {
  prelive: {
    apiBase: 'https://apis-prelive.quran.foundation',
    oauthTokenUrl: 'https://prelive-oauth2.quran.foundation/oauth2/token'
  },
  production: {
    apiBase: 'https://apis.quran.foundation',
    oauthTokenUrl: 'https://oauth2.quran.foundation/oauth2/token'
  }
}

const qfUserConfig = qfConfigMap[qfUserEnv]
const qfContentConfig = qfConfigMap[qfContentEnv]
const contentApiBase = process.env.QF_CONTENT_API_BASE || qfContentConfig.apiBase

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/supabase', '@nuxtjs/color-mode'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/confirm', '/', '/quran', '/quran/verse/*']
    },
    providers: [
      {
        name: 'google',
        url: '/auth/login/google'
      },
      {
        name: 'github',
        url: '/auth/login/github'
      }
    ]
  },
  runtimeConfig: {
    qfClientId: process.env.QF_CLIENT_ID || process.env.QURAN_CLIENT_ID,
    qfClientSecret: process.env.QF_CLIENT_SECRET || process.env.QURAN_CLIENT_SECRET,
    qfContentClientId: process.env.QF_CONTENT_CLIENT_ID || process.env.QF_CLIENT_ID || process.env.QURAN_CLIENT_ID,
    qfContentClientSecret: process.env.QF_CONTENT_CLIENT_SECRET || process.env.QF_CLIENT_SECRET || process.env.QURAN_CLIENT_SECRET,
    qfUserEnv,
    qfContentEnv,
    qfApiBase: contentApiBase,
    qfContentOAuthTokenUrl: process.env.QF_CONTENT_OAUTH_TOKEN_URL || qfContentConfig.oauthTokenUrl,
    qfUserApiBase: process.env.QF_USER_API_BASE || qfUserConfig.apiBase,
    qfOAuthTokenUrl: process.env.QF_OAUTH_TOKEN_URL || qfUserConfig.oauthTokenUrl,
    qfOAuthRedirectUri: process.env.QF_OAUTH_REDIRECT_URI,
    qfOAuthScopes: process.env.QF_OAUTH_SCOPES,
    qfTranslationIds: process.env.QF_TRANSLATION_IDS || '85',
    public: {
      qfBase: contentApiBase,
      qfEnv: qfUserEnv,
      qfUserEnv,
      qfContentEnv
    }
  }
})
