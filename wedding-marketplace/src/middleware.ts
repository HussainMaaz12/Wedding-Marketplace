// src/middleware.ts
// Edge middleware — runs before every matched route
// Cannot use Mongoose here (Edge Runtime), so we use cookies for role checks

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require specific roles
const ROLE_ACCESS: Record<string, string[]> = {
  '/admin':     ['ADMIN'],
  '/vendor':    ['VENDOR'],
  '/dashboard': ['CUSTOMER', 'VENDOR', 'ADMIN'],
}

// Auth pages that logged-in users should be redirected away from
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value
  const userRole     = request.cookies.get('user_role')?.value
  const { pathname } = request.nextUrl

  // ─── 1. Handle auth pages (login/register) ───
  // If user IS logged in → redirect them to their dashboard
  // If user is NOT logged in → let them through (they need these pages!)
  if (AUTH_PAGES.some(page => pathname.startsWith(page))) {
    if (sessionToken && userRole) {
      const dashboardUrl = getDashboardUrl(userRole)
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
    // Not logged in — let them access auth pages
    return NextResponse.next()
  }

  // ─── 2. Handle protected routes (admin/vendor/dashboard) ───
  // If no session → redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Check role-based access
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ACCESS)) {
    if (pathname.startsWith(routePrefix)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // User is logged in but wrong role — redirect to their dashboard
        const dashboardUrl = getDashboardUrl(userRole || '')
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
      break
    }
  }

  return NextResponse.next()
}

// Helper to get the right dashboard URL for a role
function getDashboardUrl(role: string): string {
  switch (role) {
    case 'ADMIN':  return '/admin/dashboard'
    case 'VENDOR': return '/vendor/dashboard'
    default:       return '/dashboard'
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
}