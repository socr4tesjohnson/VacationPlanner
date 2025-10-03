# Middleware Quick Start Guide

## Overview
This project now has comprehensive role-based middleware protection for all admin routes.

## Quick Test

### 1. Start the server
```bash
npm run dev
```

### 2. Test unauthenticated access (should fail with 401)
```bash
curl http://localhost:3000/api/admin/inquiries
```

Expected response:
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### 3. Login as admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@vacationplanner.com", "password": "admin123"}'
```

Save the token from the response.

### 4. Access protected route with token (should succeed)
```bash
curl http://localhost:3000/api/admin/inquiries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "inquiries": [...]
}
```

## Files Created

1. **C:\Projects\VacationPlanner\src\lib\middleware.ts**
   - Core middleware utilities
   - `requireAuth()` - Requires authentication
   - `requireRole(...roles)` - Requires specific role(s)
   - `requireAdmin()` - Requires admin role
   - `withMiddleware()` - Wrapper for applying middleware

2. **C:\Projects\VacationPlanner\src\middleware.ts**
   - Next.js middleware file
   - Protects all `/admin` and `/api/admin` routes
   - Checks for token presence
   - Redirects unauthenticated users

3. **C:\Projects\VacationPlanner\src\lib\test-middleware.ts**
   - Test scenarios and documentation
   - Manual testing instructions

4. **C:\Projects\VacationPlanner\MIDDLEWARE_DOCUMENTATION.md**
   - Comprehensive documentation
   - Implementation examples
   - Security best practices

## Updated Routes

All admin API routes now use middleware:

### Admin-Only Routes (require ADMIN role):
- ✓ POST /api/admin/packages
- ✓ POST /api/admin/packages/generate
- ✓ POST /api/admin/packages/scan-disney
- ✓ POST /api/admin/packages/download-image
- ✓ POST /api/admin/packages/scan-disney-images
- ✓ POST /api/admin/packages/generate-social-posts

### Authenticated Routes (any logged-in user):
- ✓ GET /api/admin/inquiries
- ✓ GET /api/admin/inquiries/[id]
- ✓ PATCH /api/admin/inquiries/[id]

## User Roles

- **ADMIN**: Full access (admin@vacationplanner.com / admin123)
- **MANAGER**: Can manage inquiries
- **AGENT**: Can view inquiries

## Key Features

✓ Two-layer security (Next.js middleware + API route middleware)
✓ Role-based access control (RBAC)
✓ Proper HTTP status codes (401, 403)
✓ Detailed error messages
✓ Token validation against database
✓ Active account checking
✓ Expired session handling
✓ Cookie and Bearer token support
✓ TypeScript type safety
✓ Reusable and composable middleware
✓ Edge cases handled (expired tokens, deleted users, inactive accounts)

## Common Usage Patterns

### Protect a new route with admin-only access:
```typescript
import { withMiddleware, requireAdmin } from "@/lib/middleware";

async function handlePOST(request: NextRequest) {
  // Your logic here
}

export const POST = withMiddleware(handlePOST, requireAdmin());
```

### Allow multiple roles:
```typescript
import { withMiddleware, requireRole } from "@/lib/middleware";
import { UserRole } from "@prisma/client";

export const GET = withMiddleware(
  handleGET,
  requireRole(UserRole.ADMIN, UserRole.MANAGER)
);
```

### Get current user in route:
```typescript
import { getUserFromRequest } from "@/lib/middleware";

async function handleGET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  console.log(`User: ${user?.email}, Role: ${user?.role}`);
  // Your logic here
}
```

## Testing Checklist

- [x] Build succeeds without errors
- [x] Middleware utilities created
- [x] All admin routes updated
- [x] Next.js middleware configured
- [ ] Manual test: Unauthenticated access returns 401
- [ ] Manual test: Invalid token returns 401
- [ ] Manual test: Admin user can access protected routes
- [ ] Manual test: Non-admin user gets 403 on admin-only routes
- [ ] Manual test: Inactive account returns 401

## Next Steps

1. Run the manual tests listed above
2. Test with the seeded admin user
3. Create test users with different roles
4. Verify error messages are helpful
5. Check session expiration works correctly

## Troubleshooting

**Issue**: "Authentication required" even with valid token
**Solution**: Check token format is `Bearer <token>` or cookie is set correctly

**Issue**: "Insufficient permissions"
**Solution**: Verify user role in database matches route requirements

**Issue**: Build warnings about Edge Runtime
**Solution**: This is expected - full validation happens in API routes, not edge middleware

## Documentation

See `MIDDLEWARE_DOCUMENTATION.md` for complete documentation including:
- Architecture overview
- All middleware functions
- Implementation examples
- Security best practices
- Error handling
- Future enhancements
