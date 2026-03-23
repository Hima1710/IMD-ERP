import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

<<<<<<< HEAD
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
=======
  // جلب المفاتيح بأمان من كل الاحتمالات
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

  // لو المفاتيح مش موجودة، كمل الطلب عادي عشان ميعملش 500 Error
  if (!supabaseUrl || !supabaseKey) {
    console.error("Middleware: Missing Supabase Env Vars")
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
>>>>>>> blackboxai-upload-all-changes
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
<<<<<<< HEAD
            request: {
              headers: request.headers,
            },
=======
            request: { headers: request.headers },
>>>>>>> blackboxai-upload-all-changes
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
<<<<<<< HEAD
            request: {
              headers: request.headers,
            },
=======
            request: { headers: request.headers },
>>>>>>> blackboxai-upload-all-changes
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

<<<<<<< HEAD
  // التاكد من اليوزر
  const { data: { user } } = await supabase.auth.getUser()

  // 🛑 لو مفيش يوزر وهو رايح لصفحة محمية (زي المنتجات) -> واديه للوجن
  if (!user && (request.nextUrl.pathname.startsWith('/products') || request.nextUrl.pathname.startsWith('/customers') || request.nextUrl.pathname === '/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ✅ لو فيه يوزر وهو رايح للوجن -> واديه للداشبورد
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
=======
  // تجديد الجلسة (Session)
  await supabase.auth.getUser()
>>>>>>> blackboxai-upload-all-changes

  return response
}

export const config = {
  matcher: [
<<<<<<< HEAD
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

=======
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
>>>>>>> blackboxai-upload-all-changes
