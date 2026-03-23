import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// 1. قراءة المفاتيح بأمان من كل المصادر الممكنة (لضمان العمل على Vercel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''

// 2. قيم احتياطية عشان الـ Build ميفشلش والصفحة متبقاش بيضاء
// ملاحظة: لو شفت "placeholder" في الكونسول، يبقى المفاتيح مش مقروءة صح في Vercel
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder'

// 3. تصدير الـ Client الأساسي (للتوافق مع الكود القديم والصفحات الحالية)
export const supabase = createClient(finalUrl, finalKey)

// 4. Browser Client (الموصى به لنظام Next.js 14 في المتصفح)
export const supabaseBrowser = createBrowserClient(finalUrl, finalKey)

// 5. Server Client (للعمليات اللي بتتم جوه الـ Server Actions أو API Routes)
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

/**
 * 6. مساعدات نظام المحلات (SaaS Helpers) 
 * تُستخدم لفلترة البيانات بناءً على معرف المحل (shop_id)
 */
export function withStoreFilter(table: string, storeId: string | null) {
  if (!storeId) {
    console.warn(`⚠️ No shop_id provided for filtering table: ${table}`)
    return (query: any) => query
  }
  return (query: any) => query.eq('shop_id', storeId)
}

/**
 * جلب معرف المحل (shop_id) الخاص بالمستخدم الحالي من الـ Metadata
 */
export async function getCurrentStoreId(supabaseClient: any) {
  const { data: { user }, error } = await supabaseClient.auth.getUser()
  if (error || !user) return null
  return user?.user_metadata?.shop_id || null
}

// 7. كود للفحص يظهر في كونسول المتصفح فقط للتأكد من الربط
if (typeof window !== 'undefined' && (finalUrl.includes('placeholder') || !supabaseUrl)) {
  console.warn("⚠️ تنبيه: مفاتيح Supabase غير مقروءة! تأكد من إعدادات Environment Variables في Vercel.");
} else if (typeof window !== 'undefined') {
  console.log("✅ [SUPABASE] Client Initialized Successfully");
}