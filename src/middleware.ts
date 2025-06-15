import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
	// Check if the user is logged in
	const isLoggedIn = request.cookies.has('auth_token')

	// Get the pathname of the request
	const { pathname } = request.nextUrl

	// Define public paths that don't require authentication
	const publicPaths = ['/login', '/api/auth/callback']

	// Check if the current path is public
	const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

	// If the user is not logged in and trying to access a protected route, redirect to login
	if (!isLoggedIn && !isPublicPath) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	// If the user is logged in and trying to access the login page, redirect to home
	if (isLoggedIn && isPublicPath) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		'/((?!_next/static|_next/image|favicon.ico|public/).*)',
	],
} 