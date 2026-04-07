export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/supabase'],
  runtimeConfig: {
    supabaseKey: process.env.SUPABASE_KEY,
    qfApiKey: process.env.QF_API_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      qfBase: 'https://api.quran.foundation'
    }
  }
})
