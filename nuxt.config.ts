const qfEnv = process.env.QF_ENV || 'prelive'

const qfConfigMap = {
  prelive: {
    apiBase: 'https://apis-prelive.quran.foundation',
    userApiBase: 'https://apis-prelive.quran.foundation',
    oauthTokenUrl: 'https://prelive-oauth2.quran.foundation/oauth2/token'
  },
  live: {
    apiBase: 'https://apis.quran.foundation',
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
      exclude: ['/login', '/confirm', '/', '/browse', '/verse/*']
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
    qfApiBase: process.env.QF_API_BASE || qfConfig.apiBase,
    qfUserApiBase: process.env.QF_USER_API_BASE || qfConfig.userApiBase,
    qfOAuthTokenUrl: process.env.QF_OAUTH_TOKEN_URL || qfConfig.oauthTokenUrl,
    qfOAuthRedirectUri: process.env.QF_OAUTH_REDIRECT_URI,
    qfTranslationIds: process.env.QF_TRANSLATION_IDS || '85',
    public: {
      qfBase: process.env.NUXT_PUBLIC_QF_BASE || qfConfig.apiBase,
      qfEnv: process.env.QF_ENV || 'prelive'
    }
  }
})
