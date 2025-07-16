import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/sso-callback(.*)',
]);

// Error route matcher copied from root middleware.ts
const errorCodes = ['401', '403', '404', '500'];
function isErrorRoute(req: NextRequest) {
  const { pathname } = req.nextUrl;
  return pathname.startsWith('/errors/');
}

export default clerkMiddleware((auth, req) => {
  // Error route logic: allow through, but redirect if not a known error code
  if (isErrorRoute(req)) {
    const { pathname } = req.nextUrl;
    if (!errorCodes.includes(pathname.split('/')[2])) {
      return NextResponse.redirect(new URL('/errors/404', req.url));
    }
    return NextResponse.next();
  }
  // Clerk protection for non-error, non-public routes
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)", "/errors/:path*"],
}; 