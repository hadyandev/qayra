# QF OAuth + Supabase Integration Plan

## User Preferences
- Refresh tokens: Base64 encoded (simple, for now)
- Auto-restore: Yes - seamless reconnection on login
- Disconnect: Revoke token on QF + delete local record

---

## Step 1: Supabase Migration

**File:** `supabase/migrations/20260421000000_qf_connections.sql`

```sql
CREATE TABLE IF NOT EXISTS public.qf_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qf_sub VARCHAR NOT NULL,
  qf_email VARCHAR,
  qf_first_name VARCHAR,
  qf_last_name VARCHAR,
  scopes TEXT[] DEFAULT '{}',
  env VARCHAR NOT NULL DEFAULT 'prelive',
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  UNIQUE(user_id, env),
  UNIQUE(qf_sub, env)
);

CREATE INDEX IF NOT EXISTS qf_connections_user_id_idx ON public.qf_connections(user_id);
CREATE INDEX IF NOT EXISTS qf_connections_qf_sub_idx ON public.qf_connections(qf_sub);

ALTER TABLE public.qf_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qf_connections_select_own" ON public.qf_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "qf_connections_insert_own" ON public.qf_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "qf_connections_update_own" ON public.qf_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "qf_connections_delete_own" ON public.qf_connections FOR DELETE USING (auth.uid() = user_id);
```

---

## Step 2: Update Callback to Save Connection

**File:** `server/api/qf/oauth/callback.ts`

Changes to GET handler:
1. After token exchange, get Supabase user via `serverSupabaseClient(event)`
2. If no user → redirect to `/login?redirect=/oauth/callback`
3. Decode id_token → get sub, email, first_name, last_name
4. Upsert into `qf_connections`:
   - user_id = supabase user id
   - qf_sub = payload.sub
   - scopes = tokens.scope.split(' ')
   - refresh_token = btoa(tokens.refresh_token)
   - env = getQfEnvKey()
5. Return success → frontend redirects

---

## Step 3: Connection Management APIs

### `server/api/qf/connection.get.ts`
```ts
// Get Supabase user
// Query qf_connections WHERE user_id = user.id AND env = current env
// Return { connected, qf_sub, qf_email, scopes, connected_at, last_synced_at }
```

### `server/api/qf/connection.delete.ts`
```ts
// Get Supabase user
// Get qf_connections record
// Revoke token on QF: POST /oauth2/revoke with refresh_token
// Delete from qf_connections
// Clear QF cookies
// Return { success: true }
```

---

## Step 4: Auto-Restore Middleware

**File:** `server/middleware/qf-session.ts`

```ts
// Runs on every server request
// If user has QF cookies → skip
// If no QF cookies:
//   1. Get Supabase user from event
//   2. Query qf_connections for this user + current env
//   3. If found:
//      - Decode refresh_token (atob)
//      - Call QF token endpoint with refresh_token
//      - Set cookies: access_token, refresh_token
//   4. If not found → do nothing
```

---

## Step 5: Composable

**File:** `composables/useQfConnection.ts`

```ts
export function useQfConnection() {
  const connection = ref<QfConnection | null>(null)
  const loading = ref(true)

  async function fetchConnection() {
    const { data } = await $fetch('/api/qf/connection')
    connection.value = data
    loading.value = false
  }

  async function disconnect() {
    await $fetch('/api/qf/connection', { method: 'DELETE' })
    connection.value = null
  }

  return { connection, loading, fetchConnection, disconnect }
}
```

---

## Step 6: Update Layout User Menu

**File:** `layouts/default.vue`

Add to user dropdown:
```vue
<div class="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
  <div v-if="qfConnection.connected" class="flex items-center gap-2">
    <div class="w-2 h-2 rounded-full bg-green-500"></div>
    <span class="text-xs text-stone-500">QF Connected</span>
    <UButton size="xs" variant="ghost" @click="disconnectQf">Disconnect</UButton>
  </div>
  <UButton v-else size="sm" block @click="showQfModal = true">
    Connect QF Account
  </UButton>
</div>
```

---

## Step 7: Update QfConnectModal

**File:** `components/QfConnectModal.vue`

- Add prop to skip consent if reconnecting
- Show connected state if already connected
- Add "Reconnect" button for existing connections

---

## Step 8: Update Callback Page

**File:** `pages/oauth/callback.vue`

- After success, redirect to `route.query.redirect || '/heatmap'`
- Show user name/email from response

---

## Implementation Notes

1. **Run migration first** - Create table in Supabase before deploying code
2. **Test flow:** Login → Connect QF → Check cookies → Logout → Login → Verify auto-restore
3. **Error handling:** If auto-restore fails, user sees "Connect QF" prompt (graceful degradation)
4. **Security:** RLS ensures users can only see their own connections
