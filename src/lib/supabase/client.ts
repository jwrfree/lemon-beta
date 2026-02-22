import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | undefined

// Create a mock client that handles missing credentials gracefully
const createMockClient = (): SupabaseClient => {
  console.warn('[Supabase Client] Credentials are missing. Using mock client.')
  // Return a minimal mock client object that won't crash during initialization
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
      getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: async () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
      update: async () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: async () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
  } as unknown as SupabaseClient
}

export const createClient = () => {
  if (supabase) return supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Support both ANON_KEY and PUBLISHABLE_DEFAULT_KEY names
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!url || !key) {
    console.warn('[Supabase Client] Missing environment variables:', { 
      url: !!url, 
      key: !!key
    })
    // Return a mock client to prevent initialization errors
    supabase = createMockClient()
    return supabase
  }

  try {
    supabase = createBrowserClient(url, key)
    console.log('[Supabase Client] Client created successfully')
    return supabase
  } catch (error) {
    console.error('[Supabase Client] Failed to create client:', error)
    // Fall back to mock client on error
    supabase = createMockClient()
    return supabase
  }
}
