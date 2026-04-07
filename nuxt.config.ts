export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/supabase'],
  runtimeConfig: {
    supabaseKey: process.env.SUPABASE_KEY,
    // Quran Foundation OAuth2 credentials (server-side only)
    qfClientId: process.env.QF_CLIENT_ID,
    qfClientSecret: process.env.QF_CLIENT_SECRET,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      qfBase: 'https://api.quran.foundation'
    }
  }
})
