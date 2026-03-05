import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// BULLETPROOF Supabase Client - Next.js 16 + Turbopack
// ============================================================

// 🔧 HARD-CODED FALLBACK FOR DEBUGGING (Replace with your values)
const FALLBACK_URL = 'https://your-project.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTc1MjAwLCJleHAiOjE5NTY1NTEyMDB9.YOUR_KEY_HERE'

// Try to get from environment, fallback to hard-coded values
let supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
let supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

// DEBUG: Show what's in environment
console.log('🔍 === ENV DEBUG ===')
console.log('Env URL:', supabaseUrl)
console.log('Env KEY:', supabaseAnonKey ? '✓ Found' : '✗ Missing')

// If env vars are missing, use fallback for debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Using FALLBACK values - Replace with real .env.local values!')
  supabaseUrl = FALLBACK_URL
  supabaseAnonKey = FALLBACK_KEY
}

console.log('=== Final Supabase Config ===')
console.log('URL:', supabaseUrl)
console.log('KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')

// Create the client
let supabase: SupabaseClient | null = null

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase client initialized successfully!')
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error)
  supabase = null
}

export { supabase }

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => supabase !== null
