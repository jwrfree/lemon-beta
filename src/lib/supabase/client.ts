import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | undefined

export const createClient = () => {
  if (supabase) return supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[Supabase Client] Missing environment variables:', { 
      url: !!url, 
      key: !!key,
      urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      keySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    console.error('Please add the following environment variables to your Vercel project:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL (e.g., https://rfbargejxzobranifajb.supabase.co)')
    console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key')
    throw new Error('Supabase configuration is incomplete. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.')
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
