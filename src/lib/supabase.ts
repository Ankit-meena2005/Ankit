import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anon) {
  // Falling back silently — the app stays functional with mock data.
  // eslint-disable-next-line no-console
  console.warn('[FarmSOS] Supabase env not set; using local mock data layer.')
}

export const supabase = createClient(url ?? 'https://placeholder.supabase.co', anon ?? 'placeholder', {
  auth: { persistSession: true, autoRefreshToken: true }
})

export const isSupabaseConfigured = Boolean(url && anon && !url.includes('placeholder'))
