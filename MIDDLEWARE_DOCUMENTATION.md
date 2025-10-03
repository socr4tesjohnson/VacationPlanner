# Role-Based Middleware Documentation

## Overview

This project implements a comprehensive role-based access control (RBAC) system using Next.js middleware and API route middleware. The system provides multiple layers of security to protect admin routes and ensure only authorized users can access sensitive operations.

## Architecture

The middleware system consists of two layers:

### 1. Next.js Middleware (Edge Runtime) - `src/middleware.ts`

**Purpose**: First line of defense, runs on all admin routes before they reach the API handlers.

**Responsibilities**:
- Checks for the presence of authentication tokens
- Blocks unauthenticated requests early
- Redirects unauthenticated users to login page (for UI routes)
- Returns 401 Unauthorized for API routes without tokens

**Limitations**:
- Runs on Edge Runtime (limited Node.js API access)
- Cannot use Prisma or bcrypt directly
- Only performs basic token presence checks
- Full validation happens in API route middleware

### 2. API Route Middleware - `src/lib/middleware.ts`

**Purpose**: Full authentication and authorization validation for API routes.

**Responsibilities**:
- Validates session tokens against the database
- Checks if user accounts are active
- Enforces role-based access control (RBAC)
- Provides reusable middleware functions
- Returns detailed error messages

**Functions**:

#### `getUserFromRequest(request: NextRequest)`
Extracts and validates the user from the session token.

```typescript
const user = await getUserFromRequest(request);
if (!user) {
  // Handle unauthenticated request
}
```

#### `requireAuth()`
Middleware function that requires any authenticated user.

```typescript
export const GET = withMiddleware(handleGET, requireAuth());
```

#### `requireRole(...roles: UserRole[])`
Middleware function that requires specific role(s).

```typescript
export const POST = withMiddleware(handlePOST, requireRole(UserRole.ADMIN, UserRole.MANAGER));
```

#### `requireAdmin()`
Shorthand for `requireRole(UserRole.ADMIN)`.

```typescript
export const POST = withMiddleware(handlePOST, requireAdmin());
```

#### `requireManager()`
Allows both ADMIN and MANAGER roles.

```typescript
export const GET = withMiddleware(handleGET, requireManager());
```

#### `withMiddleware(handler, ...middlewares)`
Wraps a route handler with one or more middleware functions.

```typescript
async function handlePOST(request: NextRequest) {
  // Your handler logic
}

export const POST = withMiddleware(handlePOST, requireAdmin());
```

#### `composeMiddleware(...middlewares)`
Composes multiple middleware functions into one.

```typescript
const authAndLog = composeMiddleware(
  requireAuth(),
  loggingMiddleware()
);

export const GET = withMiddleware(handleGET, authAndLog);
```

## User Roles

The system defines three user roles:

- **ADMIN**: Full system access, can manage all data and users
- **MANAGER**: Can manage inquiries and view reports (not yet fully implemented)
- **AGENT**: Basic access to view inquiries and customer data

## Protected Routes

### Admin-Only Routes (require ADMIN role):

**Package Management**:
- `POST /api/admin/packages` - Create vacation packages
- `POST /api/admin/packages/generate` - Generate package content with AI
- `POST /api/admin/packages/scan-disney` - Scan Disney website for offers
- `POST /api/admin/packages/download-image` - Download package images
- `POST /api/admin/packages/scan-disney-images` - Scan for Disney images
- `POST /api/admin/packages/generate-social-posts` - Generate social media posts

### Authenticated Routes (require any logged-in user):

**Inquiry Management**:
- `GET /api/admin/inquiries` - List all inquiries
- `GET /api/admin/inquiries/[id]` - Get inquiry details
- `PATCH /api/admin/inquiries/[id]` - Update inquiry status

## Implementation Examples

### 1. Creating a New Protected Route

```typescript
// src/app/api/admin/myroute/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withMiddleware, requireAdmin } from "@/lib/middleware";

async function handleGET(request: NextRequest) {
  // Your route logic here
  return NextResponse.json({ success: true, data: [] });
}

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  // Your route logic here
  return NextResponse.json({ success: true });
}

// Export with middleware
export const GET = withMiddleware(handleGET, requireAuth());
export const POST = withMiddleware(handlePOST, requireAdmin());
```

### 2. Creating a Route with Multiple Roles

```typescript
import { withMiddleware, requireRole } from "@/lib/middleware";
import { UserRole } from "@prisma/client";

async function handleGET(request: NextRequest) {
  // Accessible by both ADMIN and MANAGER
  return NextResponse.json({ success: true });
}

export const GET = withMiddleware(
  handleGET,
  requireRole(UserRole.ADMIN, UserRole.MANAGER)
);
```

### 3. Accessing User Information

```typescript
import { getUserFromRequest } from "@/lib/middleware";

async function handleGET(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use user information
  console.log(`User ${user.email} (${user.role}) accessed this route`);

  return NextResponse.json({ success: true, userId: user.id });
}
```

## Error Responses

The middleware system returns consistent error responses:

### 401 Unauthorized
Returned when:
- No authentication token is provided
- Token is invalid or expired
- User account is inactive

```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden
Returned when:
- User is authenticated but lacks required role

```json
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "details": "This resource requires one of the following roles: ADMIN"
}
```

### 500 Internal Server Error
Returned when:
- An unexpected error occurs during authentication

```json
{
  "error": "Authentication error",
  "code": "AUTH_ERROR"
}
```

## Testing

### Manual Testing with cURL

1. **Test unauthenticated access** (should return 401):
```bash
curl -X GET http://localhost:3000/api/admin/inquiries
```

2. **Login as admin**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@vacationplanner.com", "password": "admin123"}'
```

3. **Access protected route with token**:
```bash
curl -X GET http://localhost:3000/api/admin/inquiries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

4. **Test admin-only route**:
```bash
curl -X POST http://localhost:3000/api/admin/packages/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Luxury Disney World vacation",
    "type": "resort",
    "destination": "Orlando, FL",
    "nights": 7,
    "days": 8,
    "startingPrice": 3500,
    "category": "disney"
  }'
```

### Test Scenarios

See `src/lib/test-middleware.ts` for comprehensive test scenarios including:
- Unauthenticated access
- Invalid token handling
- Role-based authorization
- Admin-only route protection
- Inactive account handling

## Security Best Practices

1. **Always use HTTPS in production** - Session tokens must be transmitted securely
2. **Set secure cookie flags** - HttpOnly, Secure, SameSite=Strict
3. **Validate sessions on every request** - Don't trust client-side data
4. **Use proper error messages** - Don't leak sensitive information
5. **Implement rate limiting** - Prevent brute force attacks (not yet implemented)
6. **Log authentication events** - Monitor for suspicious activity
7. **Rotate session tokens** - Implement token refresh mechanism
8. **Set session expiration** - Currently set to 7 days

## Configuration

### Session Duration
Modify in `src/lib/auth.ts`:
```typescript
export function getSessionExpiration(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Change this value
  return expiresAt;
}
```

### Protected Route Patterns
Modify in `src/middleware.ts`:
```typescript
export const config = {
  matcher: [
    "/admin/:path*",      // All admin pages
    "/api/admin/:path*",  // All admin API routes
  ],
};
```

## Troubleshooting

### "Authentication required" on valid requests
- Check that the token is being sent correctly
- Verify the token hasn't expired (check database sessions table)
- Ensure the Authorization header format: `Bearer <token>`

### "Insufficient permissions" errors
- Verify the user's role in the database
- Check the route's required role(s)
- Ensure the user account is active

### Edge Runtime warnings
- The Next.js middleware (src/middleware.ts) runs on Edge Runtime
- It cannot use Prisma or bcrypt directly
- Full validation happens in API route middleware instead

### Session not persisting
- Check cookie settings (HttpOnly, Secure, SameSite)
- Verify session token is being saved in cookies
- Check browser cookie storage

## Future Enhancements

1. **Permission system** - Fine-grained permissions beyond roles
2. **Rate limiting** - Prevent abuse and brute force attacks
3. **Session refresh** - Auto-refresh tokens before expiration
4. **Multi-factor authentication** - Add 2FA support
5. **Audit logging** - Track all authentication events
6. **IP-based restrictions** - Limit access by IP address
7. **Device fingerprinting** - Detect suspicious login patterns
8. **Password policies** - Enforce strong passwords
9. **Account lockout** - After failed login attempts
10. **OAuth integration** - Social login support

## Related Files

- `src/middleware.ts` - Next.js middleware (Edge Runtime)
- `src/lib/middleware.ts` - API route middleware utilities
- `src/lib/auth.ts` - Authentication helper functions
- `src/lib/test-middleware.ts` - Test scenarios and examples
- `prisma/schema.prisma` - User and Session models
- `.env` - Environment variables (DATABASE_URL, etc.)

## Support

For questions or issues:
1. Check this documentation
2. Review test scenarios in `src/lib/test-middleware.ts`
3. Check console logs for detailed error messages
4. Verify database session records
