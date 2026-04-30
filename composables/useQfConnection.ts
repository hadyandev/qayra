export interface QfConnection {
  connected: boolean
  qf_sub?: string
  qf_email?: string
  qf_first_name?: string
  qf_last_name?: string
  scopes?: string[]
  connected_at?: string
  last_synced_at?: string
}

export function useQfConnection() {
  const connection = ref<QfConnection>({ connected: false })
  const loading = ref(true)

  async function fetchConnection() {
    loading.value = true
    try {
      const data = await $fetch<QfConnection>('/api/qf/connection', {
        credentials: 'include'
      })
      connection.value = data || { connected: false }
    } catch (err: any) {
      console.error('[QF] Failed to fetch connection:', err.message)
      connection.value = { connected: false }
    } finally {
      loading.value = false
    }
  }

  async function disconnect() {
    try {
      await $fetch('/api/qf/connection', { 
        method: 'DELETE',
        credentials: 'include'
      })
      connection.value = { connected: false }
    } catch (err: any) {
      console.error('[QF] Disconnect failed:', err.message)
    }
  }

  return { connection, loading, fetchConnection, disconnect }
}
