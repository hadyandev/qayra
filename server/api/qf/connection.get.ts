import { serverSupabaseClient } from '#supabase/server'
import { getQfEnvKey } from '~/server/utils/qfOAuthConfig'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { connected: false }
  }
  
  const env = getQfEnvKey()
  
  const { data: connection } = await supabase
    .from('qf_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('env', env)
    .single()
  
  if (!connection) {
    return { connected: false }
  }
  
  return {
    connected: true,
    qf_sub: connection.qf_sub,
    qf_email: connection.qf_email,
    qf_first_name: connection.qf_first_name,
    qf_last_name: connection.qf_last_name,
    scopes: connection.scopes,
    connected_at: connection.connected_at,
    last_synced_at: connection.last_synced_at
  }
})
