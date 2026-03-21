'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(email: string, password: string) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  console.log('🔐 [AUTH-ACTION] Attempting login for:', email)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('❌ [AUTH-ACTION] Login failed:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }

  console.log('✅ [AUTH-ACTION] Login successful for:', email)
  console.log('🔐 [AUTH-ACTION] Session set in cookies')

  return {
    success: true,
    user: data.user,
  }
}
