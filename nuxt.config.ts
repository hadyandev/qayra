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
    }
  },
  runtimeConfig: {
    qfClientId: process.env.QF_CLIENT_ID || process.env.QURAN_CLIENT_ID,
    qfClientSecret: process.env.QF_CLIENT_SECRET || process.env.QURAN_CLIENT_SECRET,
    qfApiBase:
      process.env.QF_API_BASE || 'https://apis-prelive.quran.foundation',
    qfOAuthTokenUrl:
      process.env.QF_OAUTH_TOKEN_URL ||
      'https://prelive-oauth2.quran.foundation/oauth2/token',
    qfTranslationIds: process.env.QF_TRANSLATION_IDS || '85',
    public: {
      qfBase: process.env.NUXT_PUBLIC_QF_BASE || 'https://api.quran.foundation'
    }
  }
})
