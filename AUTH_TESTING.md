# Authentication Flow Testing Guide

## Testing the Login/Logout Flow

Follow these steps to test the complete authentication implementation:

### 1. Prerequisites

Ensure you have:
- A seeded database with at least one admin user
- The dev server running on http://localhost:3000

### 2. Test Login Flow

1. **Navigate to Login Page**
   - Go to http://localhost:3000/login
   - You should see a professional login form with:
     - Vacation Planner branding
     - Email and password fields
     - Vacation-themed background decorations

2. **Test Form Validation**
   - Try submitting without email or password - should show validation errors
   - Try invalid email format - should show email validation error
   - Try short password - should show password length error

3. **Test Invalid Login**
   - Enter incorrect credentials
   - Should display error message: "Login failed. Please check your credentials."
   - Should not redirect

4. **Test Successful Login**
   - Enter valid admin credentials from your database
   - Should show loading state with spinner
   - Should redirect to /admin/dashboard
   - Should store session token in localStorage

### 3. Test Protected Routes

1. **Access Admin Dashboard**
   - After login, you should be on /admin/dashboard
   - Should see:
     - Admin header with user info
     - Dashboard navigation
     - Logout button
     - Inquiries list

2. **Test Direct Access (Without Auth)**
   - Open a new incognito/private window
   - Try to access http://localhost:3000/admin/dashboard
   - Should redirect to /login page
   - Should show loading spinner during auth check

### 4. Test Header Auth State

1. **While Logged Out**
   - Visit homepage (/)
   - Header should show "Login" button (purple/pink gradient)

2. **While Logged In**
   - Visit homepage (/)
   - Header should show:
     - "Admin" button (purple/pink gradient)
     - "Logout" button (gray gradient)

### 5. Test Logout Flow

1. **From Admin Dashboard**
   - Click the "Logout" button in admin header
   - Should clear session token from localStorage
   - Should redirect to /login page
   - User state should be cleared

2. **From Public Header**
   - Navigate to homepage while logged in
   - Click "Logout" button in main header
   - Should redirect to /login
   - Should clear authentication state

### 6. Test Session Persistence

1. **Browser Refresh**
   - Log in successfully
   - Refresh the page
   - Should remain logged in
   - Should not redirect to login

2. **New Tab**
   - Log in successfully
   - Open new tab to http://localhost:3000/admin/dashboard
   - Should be automatically authenticated
   - Should see dashboard without login

3. **Session Expiration**
   - If you wait 7 days (or manually delete session from DB)
   - Accessing protected route should redirect to login
   - Should show "Invalid or expired session" if you check /api/auth/me

### 7. Test Admin Redirect

1. **Visit /admin**
   - If logged in: should redirect to /admin/dashboard
   - If logged out: should redirect to /login

### 8. API Authentication Tests

Use browser DevTools or curl to test API endpoints:

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'

# Test get current user (replace TOKEN with actual token)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Test logout (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

## Expected Behavior Summary

### Login Page
- Professional UI with vacation theme
- Real-time form validation
- Loading states during submission
- Clear error messages
- Redirects to /admin/dashboard on success

### Protected Routes
- Automatically redirect to /login if not authenticated
- Show loading spinner during auth check
- Preserve intended destination (optional enhancement)

### Header Component
- Shows login button when logged out
- Shows admin + logout buttons when logged in
- Hides on /login and /admin pages (admin has own header)

### Admin Layout
- Custom header with user info
- Navigation to dashboard and add package
- Logout button
- Wraps all admin pages with auth protection

### Session Management
- Tokens stored in localStorage (key: "session_token")
- 7-day expiration
- Automatic validation on mount
- Proper cleanup on logout

## Common Issues & Solutions

### Issue: Redirect loop
**Solution:** Clear localStorage and cookies, then try logging in again

### Issue: "No session token provided"
**Solution:** Check that login successfully stored token in localStorage

### Issue: Auth state not updating
**Solution:** Make sure AuthProvider wraps the entire app in layout.tsx

### Issue: Header shows wrong auth state
**Solution:** Check that Header component is client component and uses useAuth hook

## Files Modified

1. `/src/contexts/AuthContext.tsx` - Auth state management
2. `/src/app/login/page.tsx` - Login UI
3. `/src/components/auth/ProtectedRoute.tsx` - Route protection
4. `/src/app/admin/layout.tsx` - Admin layout with auth
5. `/src/components/layout/Header.tsx` - Header with auth state
6. `/src/app/layout.tsx` - Root layout with AuthProvider
7. `/src/components/providers/Providers.tsx` - Client-side providers
8. `/src/app/admin/page.tsx` - Admin redirect logic
9. `/src/app/admin/dashboard/page.tsx` - Updated to use new auth

## API Endpoints Used

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/admin/inquiries` - Protected admin endpoint (requires auth)
