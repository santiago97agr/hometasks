import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Siempre devolver una respuesta válida
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // ✅ Rutas públicas
        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/api/health') ||
          pathname === '/'
        ) {
          return true
        }

        // ✅ Requiere sesión
        return !!token
      }
    },
    // ✅ Si no está autorizado -> redirigir al login
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    // Aplica a todo excepto assets y favicon
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
