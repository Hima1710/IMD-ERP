
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// BULLETPROOF Supabase Client - Next.js 16 + Turbopack
// ============================================================

// Use bracket notation for safer access in Next.js 16 with Turbopack
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

// DEBUG: Log what's being loaded
console.log('🔍 [SUPABASE] Loading configuration...')
console.log('🔍 [SUPABASE] URL:', supabaseUrl || '✗ MISSING')
console.log('🔍 [SUPABASE] KEY:', supabaseAnonKey ? '✓ Found' : '✗ MISSING')

// Create a type-safe supabase client that handles missing env vars
function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:', {
      url: supabaseUrl ? '✓' : '✗',
      key: supabaseAnonKey ? '✓' : '✗'
    })
    return null
  }
  
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client created successfully!')
    return client
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error)
    return null
  }
}

export const supabase = createSupabaseClient()

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => supabase !== null

