import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware - Protects admin routes
 *
 * Note: This middleware performs basic token validation.
 * Full authentication validation happens in the API route middleware
 * due to Edge Runtime limitations with Prisma/bcrypt.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin route (page or API)
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Skip middleware for login routes
  if (pathname === "/api/admin/login" || pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  // If this is an admin route, check for basic token presence
  if (isAdminRoute) {
    // Extract token from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie");

    let hasToken = false;

    // Check Authorization header (Bearer token)
    if (authHeader?.startsWith("Bearer ")) {
      hasToken = true;
    }

    // Check cookie
    if (!hasToken && cookieHeader) {
      const cookies = cookieHeader.split(";").reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      );
      if (cookies["session_token"]) {
        hasToken = true;
      }
    }

    // If no token found, block access
    // Note: Full validation happens in the API route middleware
    if (!hasToken) {
      if (pathname.startsWith("/api/")) {
        // API routes get 401 JSON response
        return NextResponse.json(
          {
            error: "Authentication required",
            code: "UNAUTHORIZED",
          },
          { status: 401 }
        );
      } else {
        // Page routes redirect to login
        const loginUrl = new URL("/api/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Token present - allow request to continue
    // Full validation and role checking happens in the API route middleware
    return NextResponse.next();
  }

  // Not an admin route - continue normally
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 * Using matcher for better performance
 */
export const config = {
  matcher: [
    /*
     * Match all admin routes:
     * - /admin (and all sub-pages)
     * - /api/admin (and all API routes under admin)
     * Exclude static files and Next.js internal routes
     */
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
