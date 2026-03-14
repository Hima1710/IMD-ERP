import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase'

export async function middleware(request: NextRequest) {
  // ✅ Modern @supabase/ssr with getAll/setAll()
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  let response = NextResponse.next({
    request,
  })

  // Debug cookies (chunked sb-* cookies)
  const authCookies = request.cookies.getAll().filter(c => c.name.startsWith('sb-'))
  console.log(`🔐 [MIDDLEWARE] Auth cookies found: ${authCookies.length}`, authCookies.map(c => `${c.name}=${c.value.slice(0,20)}...`))

  try {
    // 🔄 PROPERLY refresh session FIRST
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshError) {
      console.log('🔓 [MIDDLEWARE] Refresh failed:', refreshError.message)
    } else if (session) {
      console.log('🔄 [MIDDLEWARE] Session refreshed:', session.user.email)
    }

    // ✅ getUser() AFTER refresh
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError) {
      console.error("🚫 [MIDDLEWARE] getUser failed:", getUserError.message)
    } else if (user) {
      console.log("✅ [MIDDLEWARE] User authenticated:", user.email)
    } else {
      console.log("🚫 [MIDDLEWARE] No user session after refresh")
    }

    const { pathname } = request.nextUrl
    const isPublicRoute = pathname.startsWith('/login') || pathname === '/'

    // Allow login → dashboard transition
    const isLoginTransition = pathname === '/' && request.headers.get('referer')?.includes('/login')
    if (isLoginTransition) {
      console.log("⏳ [MIDDLEWARE] Login transition - allowing")
      return response
    }

    // 🔒 Protect app routes
    if (!user && !isPublicRoute) {
      console.log(`🚫 [MIDDLEWARE] Unauthorized → /login (path: ${pathname})`)
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set(`return_to`, encodeURI(request.url))
      return NextResponse.redirect(url)
    }

    // 🔄 Redirect authenticated users from login
    if (user && pathname.startsWith('/login')) {
      console.log("🔄 [MIDDLEWARE] Auth user → dashboard")
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

  } catch (err) {
    console.error('[MIDDLEWARE] Error:', err)
  }

  // 🔄 Forward ALL cookies to client response (modern SSR)
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      // Session refreshed - cookies already updated via setAll()
    }
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

