import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Public routes that don't need any auth check.
// Skipping getUser() here saves ~300-800ms on the initial landing page load.
const PUBLIC_ROUTES = ['/', '/login', '/auth', '/guest-tour']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Fast-path: skip Supabase auth entirely for public pages
    if (PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith('/auth/')
    )) {
        return NextResponse.next()
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
