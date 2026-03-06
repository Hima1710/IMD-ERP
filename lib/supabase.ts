
import { createBrowserClient } from '@supabase/ssr'

// ============================================================
// Supabase Client - Next.js 16 + Turbopack with proper SSR
// ============================================================

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

console.log('🔍 [SUPABASE] Loading configuration...')
console.log('🔍 [SUPABASE] URL:', supabaseUrl || '✗ MISSING')
console.log('🔍 [SUPABASE] KEY:', supabaseAnonKey ? '✓ Found' : '✗ MISSING')

function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:', {
      url: supabaseUrl ? '✓' : '✗',
      key: supabaseAnonKey ? '✓' : '✗'
    })
    return null
  }
  
  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client created successfully!')
    return client
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error)
    return null
  }
}

export const supabase = createSupabaseClient()

export const isSupabaseConfigured = () => supabase !== null

