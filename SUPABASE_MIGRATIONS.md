# Running Migrations (Manual Method)

Since the local Supabase CLI isn't configured, run these SQL files directly in Supabase Dashboard SQL Editor:

## Option 1: Supabase Dashboard SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Run each file in order

## Migration Files

### 1. notes.sql (Required - Core tables)
Copy contents from: `supabase/migrations/20260414000000_notes.sql`

### 2. disable_rls_for_testing.sql (Optional - For testing without auth)
Copy contents from: `supabase/migrations/20260414001000_disable_rls_for_testing.sql`

### 3. sources_and_speakers.sql (Required - Dynamic sources/speakers)
Copy contents from: `supabase/migrations/20260414002000_sources_and_speakers.sql`

## Running Order

1. Run `20260414000000_notes.sql` first
2. (Optional) Run `20260414001000_disable_rls_for_testing.sql` for testing
3. Run `20260414002000_sources_and_speakers.sql` for dynamic sources/speakers

## Option 2: Link with Supabase CLI

If you want to use `npx supabase` in the future:

```bash
# Install Supabase CLI locally
npm install -D @supabase/cli

# Link to your project (get project ref from Supabase dashboard)
npx supabase link --project-ref your-project-ref

# Now you can use:
npx supabase db push  # Push local migrations
npx supabase migration up  # Apply pending migrations
```

Your project ref: `ouehzbkiyutfsfjeaonq`
