import { createClient } from '@supabase/supabase-js'

// بنجرب نقرأ بكل الطرق الممكنة عشان نرضي فيرسل
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

// لو لسه مش لاقيهم، بنحط قيم وهمية بس عشان الصفحة متضربش "صفحة بيضاء"
// أول ما المفاتيح تقرأ صح، القيم دي هتتبدل أوتوماتيك
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder'

export const supabase = createClient(finalUrl, finalKey)

// كود للفحص بس (هيظهر في الكونسول عندك)
if (typeof window !== 'undefined' && finalUrl.includes('placeholder')) {
  console.warn("⚠️ تنبيه: مفاتيح سوبابيز لسه مش مقروءة صح في المتصفح!")
}