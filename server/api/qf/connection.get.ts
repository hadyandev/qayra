import { serverSupabaseClient } from '#supabase/server'
import { getQfEnvKey } from '~/server/utils/qfOAuthConfig'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('[QF Connection] No user found')
    return { connected: false }
  }
  
  console.log('[QF Connection] User:', user.id)
  
  const env = getQfEnvKey()
  console.log('[QF Connection] Env:', env)
  
  const { data: connection, error } = await supabase
    .from('qf_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('env', env)
    .single()
  
  console.log('[QF Connection] Query result:', { connection: !!connection, error: error?.message })
  
  if (!connection || error) {
    return { connected: false }
  }
  
  console.log('[QF Connection] Found:', connection.id, 'qf_sub:', connection.qf_sub)
  
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
