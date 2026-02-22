import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | undefined

export const createClient = () => {
  if (supabase) return supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Supabase environment variables are missing:', { url: !!url, key: !!key })
    // Return a placeholder client during build/prerendering without env vars.
    // API calls will fail at runtime if env vars are not configured.
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
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
