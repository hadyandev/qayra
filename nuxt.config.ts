const qfEnv = process.env.QF_ENV || 'prelive'

const contentApiBase = process.env.QF_CONTENT_API_BASE || 'https://apis-prelive.quran.foundation'
const contentIsPrelive = contentApiBase.includes('prelive')
const contentOAuthTokenUrl = contentIsPrelive
  ? 'https://prelive-oauth2.quran.foundation/oauth2/token'
  : 'https://oauth2.quran.foundation/oauth2/token'

const qfConfigMap = {
  prelive: {
    userApiBase: 'https://apis-prelive.quran.foundation',
    oauthTokenUrl: 'https://prelive-oauth2.quran.foundation/oauth2/token'
  },
  production: {
    userApiBase: 'https://apis.quran.foundation',
    oauthTokenUrl: 'https://oauth2.quran.foundation/oauth2/token'
  },
  live: {
    userApiBase: 'https://apis.quran.foundation',
    oauthTokenUrl: 'https://oauth2.quran.foundation/oauth2/token'
  }
}

const qfConfig = qfConfigMap[qfEnv as keyof typeof qfConfigMap] || qfConfigMap.prelive

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
    qfContentClientId: process.env.QF_CONTENT_CLIENT_ID || process.env.QF_CLIENT_ID,
    qfContentClientSecret: process.env.QF_CONTENT_CLIENT_SECRET || process.env.QF_CLIENT_SECRET,
    qfApiBase: contentApiBase,
    qfContentOAuthTokenUrl: process.env.QF_CONTENT_OAUTH_TOKEN_URL || contentOAuthTokenUrl,
    qfUserApiBase: process.env.QF_USER_API_BASE || qfConfig.userApiBase,
    qfOAuthTokenUrl: process.env.QF_OAUTH_TOKEN_URL || qfConfig.oauthTokenUrl,
    qfOAuthRedirectUri: process.env.QF_OAUTH_REDIRECT_URI,
    qfOAuthScopes: process.env.QF_OAUTH_SCOPES,
    qfTranslationIds: process.env.QF_TRANSLATION_IDS || '85',
    public: {
      qfBase: contentApiBase,
      qfEnv: process.env.QF_ENV || 'prelive'
    }
  }
})
