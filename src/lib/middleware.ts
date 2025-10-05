import { NextRequest, NextResponse } from "next/server";
import { extractSessionToken, validateSessionToken } from "./auth";
import { UserRole } from "@prisma/client";

/**
 * Error response types for better error handling
 */
export type AuthError = {
  error: string;
  code?: string;
};

/**
 * Extended Request with user information
 */
export type AuthenticatedRequest = NextRequest & {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    active: boolean;
  };
};

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
  request: NextRequest
) => Promise<NextResponse | null>;

/**
 * Extract and validate user from session token
 * Returns user object or null if invalid
 */
export async function getUserFromRequest(request: NextRequest): Promise<{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
} | null> {
  try {
    const token = extractSessionToken(request);

    if (!token) {
      return null;
    }

    const user = await validateSessionToken(token);

    if (!user) {
      return null;
    }

    // Check if user account is active
    if (!user.active) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}

/**
 * Middleware: Require authentication
 * Validates that a user is logged in with a valid session
 * Returns 401 if not authenticated
 */
export function requireAuth(): MiddlewareFunction {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        } as AuthError,
        { status: 401 }
      );
    }

    return null; // Continue to next middleware or handler
  };
}

/**
 * Middleware: Require specific role(s)
 * Validates that the authenticated user has one of the specified roles
 * Returns 401 if not authenticated, 403 if authenticated but lacking permission
 *
 * @param roles - Array of allowed roles
 */
export function requireRole(...roles: UserRole[]): MiddlewareFunction {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const user = await getUserFromRequest(request);

    // Check authentication
    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        } as AuthError,
        { status: 401 }
      );
    }

    // Check role authorization
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        {
          error: "Insufficient permissions",
          code: "FORBIDDEN",
          details: `This resource requires one of the following roles: ${roles.join(", ")}`,
        } as AuthError & { details: string },
        { status: 403 }
      );
    }

    return null; // Continue to next middleware or handler
  };
}

/**
 * Middleware: Require admin role
 * Shorthand for requireRole('ADMIN')
 * Returns 401 if not authenticated, 403 if not an admin
 */
export function requireAdmin(): MiddlewareFunction {
  return requireRole(UserRole.ADMIN);
}

/**
 * Middleware: Require manager or admin role
 * Allows both managers and admins to access the resource
 */
export function requireManager(): MiddlewareFunction {
  return requireRole(UserRole.ADMIN, UserRole.MANAGER);
}

/**
 * Compose multiple middleware functions
 * Runs middleware in sequence, stopping if any returns a response
 *
 * @param middlewares - Array of middleware functions to compose
 */
export function composeMiddleware(
  ...middlewares: MiddlewareFunction[]
): MiddlewareFunction {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    for (const middleware of middlewares) {
      const response = await middleware(request);
      if (response) {
        return response; // Stop on first middleware that returns a response
      }
    }
    return null; // All middleware passed
  };
}

/**
 * Wrapper function to apply middleware to route handlers
 * Makes it easier to use middleware in API routes
 *
 * @param handler - The route handler function
 * @param middlewares - Middleware functions to apply
 * @returns Wrapped handler with middleware
 */
export function withMiddleware(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  ...middlewares: MiddlewareFunction[]
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Run all middleware
    for (const middleware of middlewares) {
      const response = await middleware(request);
      if (response) {
        return response; // Return error response if middleware fails
      }
    }

    // All middleware passed, run the actual handler
    return handler(request, context);
  };
}

/**
 * Helper to create consistent error responses
 */
export function createErrorResponse(
  message: string,
  status: number,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code: code || `ERROR_${status}`,
    } as AuthError,
    { status }
  );
}

/**
 * Helper to create success responses
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status }
  );
}
