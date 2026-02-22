import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

// Create a mock client that handles missing credentials gracefully
const createMockClient = (): SupabaseClient => {
  console.warn('[Supabase Server Client] Credentials are missing. Using mock client.')
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

export async function createClient() {
  const cookieStore = await cookies()
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.warn('[Supabase Server Client] Missing credentials, using mock client')
    return createMockClient()
  }

  try {
    return createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('[Supabase Server Client] Failed to create client:', error)
    return createMockClient()
  }
}
