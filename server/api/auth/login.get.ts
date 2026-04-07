
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  const url = `${config.public.qfBase}/oauth/authorize?client_id=${config.qfClientId}&redirect_uri=${config.qfRedirectUri}&response_type=code`

  return sendRedirect(event, url)
})
