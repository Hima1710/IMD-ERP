import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options))
        },
      },
    }
  )

  let response = NextResponse.next({ request })

  // Protected routes (exclude public)
  const pathname = request.nextUrl.pathname
  const isPublic = pathname === '/' || pathname.startsWith('/login') || pathname.match(/\\.(ico|png|jpg|jpeg|gif|svg|js|css|wasm|tff|woff|woff2)$/i)
  
  // Always refresh session cookies
  await supabase.auth.getUser()
  
  const { data: { user } } = await supabase.auth.getUser()

  // No user + protected route → login
  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('return_to', encodeURI(request.url))
    return NextResponse.redirect(redirectUrl)
  }

  // Auth user on login → home
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

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

