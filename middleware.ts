import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Middleware funcionando correctamente
    return
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Permitir acceso a rutas públicas
        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/api/health') ||
          pathname === '/'
        ) {
          return true
        }
        
        // Requerir autenticación para rutas protegidas
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
