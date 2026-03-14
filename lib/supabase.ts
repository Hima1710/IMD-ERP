import { createBrowserClient, createServerClient } from '@supabase/ssr'

// ============================================================
// Supabase Clients - Next.js 14 SaaS Ready (Multi-tenancy)
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Check .env.local')
}

console.log('✅ [SUPABASE] SaaS Client Loaded:', supabaseUrl.slice(0, 30) + '...')

// Browser Client
export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server Client Factory
export function supabaseServer(cookies: any) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value, options }) => cookies.set(name, value, options))
      },
    },
  })
}

// SaaS Multi-Tenancy Helper - Filter queries by store_id
export function withStoreFilter(table: string, storeId: string | null) {
  if (!storeId) {
    console.warn('⚠️ No store_id provided for SaaS filter')
    return (query: any) => query
  }
  
  return (query: any) => query.eq('store_id', storeId)
}

// SaaS Auth Helper - Get current store_id from user metadata
export async function getCurrentStoreId(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.user_metadata?.store_id || null
}

// Export for compatibility
export { supabaseUrl, supabaseAnonKey }
export { createBrowserClient, createServerClient } from '@supabase/ssr'

// Backward compatibility
export const supabase = supabaseBrowser

