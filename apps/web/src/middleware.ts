import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  const isPublicPage = pathname.startsWith('/booking')
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/cadastro' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  const isOnboardingPage = pathname === '/onboarding'

  if (isPublicPage) return NextResponse.next()

  if (!token) {
    if (isAuthPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage) return NextResponse.redirect(new URL('/dashboard', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json).*)'],
}
