import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the auth token from cookies
  const supabaseAuthToken = request.cookies.get('sb-access-token')?.value ||
                           request.cookies.get('sb-auth-token')?.value

  // If user is NOT logged in (no auth token) and trying to access protected pages
  if (!supabaseAuthToken && pathname !== '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user IS logged in and trying to access login page
  if (supabaseAuthToken && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

