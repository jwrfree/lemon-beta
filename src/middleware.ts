import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { 
    data: { user }, 
  } = await supabase.auth.getUser()

  // Protected Routes Pattern
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/home') || 
                           request.nextUrl.pathname.startsWith('/wallets') ||
                           request.nextUrl.pathname.startsWith('/transactions') ||
                           request.nextUrl.pathname.startsWith('/budgeting') ||
                           request.nextUrl.pathname.startsWith('/settings');

  const isAuthRoute = request.nextUrl.pathname === '/' || 
                      request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/signup');

  // Redirect logic
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes, though you might want to protect some of these too)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
