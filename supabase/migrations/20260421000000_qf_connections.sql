-- QF OAuth connections table
-- Links Supabase users to their Quran Foundation OAuth accounts

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

DROP POLICY IF EXISTS "qf_connections_select_own" ON public.qf_connections;
CREATE POLICY "qf_connections_select_own" ON public.qf_connections FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "qf_connections_insert_own" ON public.qf_connections;
CREATE POLICY "qf_connections_insert_own" ON public.qf_connections FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "qf_connections_update_own" ON public.qf_connections;
CREATE POLICY "qf_connections_update_own" ON public.qf_connections FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "qf_connections_delete_own" ON public.qf_connections;
CREATE POLICY "qf_connections_delete_own" ON public.qf_connections FOR DELETE USING (auth.uid() = user_id);
