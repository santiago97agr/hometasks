import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl

    // 🔓 Permitir rutas públicas sin sesión
    if (
      pathname.startsWith('/api/auth') ||
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/' ||
      pathname.startsWith('/api/health')
    ) {
      return NextResponse.next()
    }

    // 🔒 Si no hay sesión, redirigir a login
    if (!req.nextauth?.token) {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }

    // ✅ Si hay sesión, seguir
    return NextResponse.next()
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
