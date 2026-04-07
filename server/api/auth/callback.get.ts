
export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)
  const config = useRuntimeConfig()

  const token = await $fetch(`${config.public.qfBase}/oauth/token`, {
    method: 'POST',
    body: {
      code,
      client_id: config.qfClientId,
      client_secret: config.qfClientSecret,
      grant_type: 'authorization_code'
    }
  })

  setCookie(event, 'qf_token', token.access_token)

  return sendRedirect(event, '/')
})
