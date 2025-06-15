import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /security, /api/vulnerability-reports)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/auth/callback'

  // Get the token from the cookies
  const token = request.cookies.get('auth_token')?.value

  // Redirect logic
  if (isPublicPath && token) {
    // If the user is logged in and tries to access login page,
    // redirect them to the home page
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isPublicPath && !token) {
    // If the user is not logged in and tries to access a protected route,
    // redirect them to the login page
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 