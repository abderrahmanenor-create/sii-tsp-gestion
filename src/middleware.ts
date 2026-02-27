import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl

      // Public routes
      if (
        pathname.startsWith("/auth") ||
        pathname.startsWith("/api/auth") ||
        pathname === "/" ||
        pathname === "/login" ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/public") ||
        pathname.startsWith("/uploads")
      ) {
        return true
      }

      // Check if user is authenticated
      if (!token) {
        return false
      }

      const userRole = token.role as Role

      // Admin only routes
      if (pathname.startsWith("/utilisateurs") || pathname.startsWith("/api/users")) {
        return userRole === Role.ADMIN
      }

      // Chef de projet and Admin routes
      if (pathname.startsWith("/equipes") && req.method !== "GET") {
        return userRole === Role.ADMIN || userRole === Role.CHEF_PROJET
      }

      // All authenticated users can access these routes
      const allowedRoutes = [
        "/dashboard",
        "/taches",
        "/notes",
        "/stock",
        "/pointage",
        "/zones",
        "/equipes",
        "/api/taches",
        "/api/notes-vocales",
        "/api/stock",
        "/api/pointage",
        "/api/zones",
        "/api/equipes"
      ]

      if (allowedRoutes.some(route => pathname.startsWith(route))) {
        return true
      }

      return true
    }
  },
  pages: {
    signIn: "/login"
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)"
  ]
}
