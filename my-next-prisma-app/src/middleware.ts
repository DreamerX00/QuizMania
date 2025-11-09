import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/explore",
  "/premium",
  "/leaderboard",
  "/clear-session",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/api/auth",
  "/api/health",
  "/api/leaderboard",
];

// Admin routes requiring elevated permissions
const adminRoutes = ["/admin"];

// Error route validator
const errorCodes = ["401", "403", "404", "500"];

function isErrorRoute(pathname: string): boolean {
  return pathname.startsWith("/errors/");
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route));
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Validate error routes
    if (isErrorRoute(pathname)) {
      const errorCode = pathname.split("/")[2];
      if (!errorCode || !errorCodes.includes(errorCode)) {
        return NextResponse.redirect(new URL("/errors/404", req.url));
      }
      return NextResponse.next();
    }

    // Allow public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // Check admin routes
    if (isAdminRoute(pathname)) {
      const userRole = token?.role as string;
      if (!["ADMIN", "OWNER"].includes(userRole)) {
        return NextResponse.redirect(new URL("/errors/403", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes and API health checks
        if (isPublicRoute(pathname)) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    "/api/:path*",
  ],
};
