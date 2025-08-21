import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Middleware funcionando correctamente
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Rutas públicas
        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/api/health') ||
          pathname === '/'
        ) {
          return true
        }

        // Requerir autenticación
        return !!token
      }
    },
    // 👇 importante: define dónde redirigir si no está autorizado
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
