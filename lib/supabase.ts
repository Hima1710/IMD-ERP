import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// 1. قراءة المفاتيح بأمان (بنجرب كل المسميات)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''

// 2. قيم احتياطية عشان الـ Build ميفشلش والصفحة متبقاش بيضاء
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder'

// 3. تصدير الـ Client الأساسي (للتوافق مع باقي الصفحات)
export const supabase = createClient(finalUrl, finalKey)

// 4. Browser Client (لنظام Next.js 14)
export const supabaseBrowser = createBrowserClient(finalUrl, finalKey)

// 5. Server Client (للعمليات اللي بتتم على السيرفر)
export function supabaseServer(cookies: any) {
  return createServerClient(finalUrl, finalKey, {
    cookies: {
      getAll() {
        return cookies.getAll()
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }) => cookies.set(name, value, options))
      },
    },
  })
}

// 6. مساعدات نظام المحلات (SaaS Helpers)
export function withStoreFilter(table: string, storeId: string | null) {
  if (!storeId) return (query: any) => query
  return (query: any) => query.eq('shop_id', storeId)
}

export async function getCurrentStoreId(supabaseClient: any) {
  const { data: { user } } = await supabaseClient.auth.getUser()
  return user?.user_metadata?.shop_id || null
}

// فحص بسيط في الكونسول
if (typeof window !== 'undefined' && finalUrl.includes('placeholder')) {
  console.warn("⚠️ تنبيه: مفاتيح سوبابيز لسه مش مقروءة صح في المتصفح!")
}