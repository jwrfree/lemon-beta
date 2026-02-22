import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | undefined

export const createClient = () => {
  if (supabase) return supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Supabase environment variables are missing:', { url: !!url, key: !!key })
    // During SSR/build time, NEXT_PUBLIC env vars may not be available in the build environment.
    // Return a placeholder client so static pre-render doesn't crash.
    // In a real production deployment the vars will always be set, so this path is never reached
    // at runtime. If they ARE missing at runtime (misconfiguration), all Supabase API calls
    // will fail with network errors — which is intentionally visible.
    if (typeof window === 'undefined') {
      console.warn(
        '[Supabase] Running without env vars on the server (SSR/build). ' +
        'Placeholder client returned — ensure NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your deployment environment.'
      )
      return createBrowserClient(
        'https://placeholder.supabase.co',
        'placeholder-anon-key'
      )
    }
    throw new Error('Supabase configuration is incomplete')
  }

  try {
    supabase = createBrowserClient(url, key)
    console.log('Supabase client created successfully')
    return supabase
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw error
  }
}
