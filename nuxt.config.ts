
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    supabaseKey: process.env.SUPABASE_KEY,
    qfClientId: process.env.QF_CLIENT_ID,
    qfClientSecret: process.env.QF_CLIENT_SECRET,
    qfRedirectUri: process.env.QF_REDIRECT_URI,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      qfBase: process.env.QF_API_BASE_URL
    }
  }
})
