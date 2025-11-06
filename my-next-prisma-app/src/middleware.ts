import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/error",
  "/login",
  "/signup",
  "/sso-callback",
];

// Error route matcher
const errorCodes = ["401", "403", "404", "500"];
function isErrorRoute(pathname: string) {
  return pathname.startsWith("/errors/");
}

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Allow error routes
    if (isErrorRoute(pathname)) {
      if (!errorCodes.includes(pathname.split("/")[2])) {
        return NextResponse.redirect(new URL("/errors/404", req.url));
      }
      return NextResponse.next();
    }

    // Allow public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // Protected routes require authentication (handled by withAuth)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes and auth routes
        if (isPublicRoute(pathname) || pathname.startsWith("/api/auth")) {
          return true;
        }

        // Require token for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/errors/:path*",
  ],
};
