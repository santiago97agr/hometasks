import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Middleware adicional aquí si es necesario
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/api/tasks/:path*', '/api/areas/:path*', '/api/dashboard/:path*']
}
