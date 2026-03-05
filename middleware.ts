
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.log("🔐 [MIDDLEWARE] Auth error:", error.message)
  } else if (user) {
    console.log("🔐 [MIDDLEWARE] User session exists:", user.email)
  } else {
    console.log("🔐 [MIDDLEWARE] No valid session")
  }

  const { pathname } = request.nextUrl

  // Allow public routes
  const publicRoutes = ['/login', '/auth', '/api/auth']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Protected routes - redirect to login if no session
  if (!user && !isPublicRoute && pathname !== '/login') {
    console.log("🔐 [MIDDLEWARE] Redirecting unauthenticated user to /login")
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and tries to access login page, redirect to home
  if (user && pathname === '/login') {
    console.log("🔐 [MIDDLEWARE] User already logged in, redirecting to /")
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

