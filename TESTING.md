# VacationPlanner Testing Suite

## Overview

This document provides a comprehensive overview of the testing infrastructure set up for the VacationPlanner application. The testing suite is designed to ensure robust quality control through unit tests, API route tests, and component tests.

## 🎯 Testing Goals

1. **Code Coverage:** Maintain >70% coverage across all critical paths
2. **Quality Assurance:** Catch bugs before they reach production
3. **Regression Prevention:** Ensure new changes don't break existing functionality
4. **Documentation:** Tests serve as living documentation of expected behavior
5. **Confidence:** Deploy with confidence knowing critical features are tested

## 📁 Test Structure

```
__tests__/
├── api/
│   └── auth/
│       ├── login.test.ts       # POST /api/auth/login tests
│       ├── logout.test.ts      # POST /api/auth/logout tests
│       └── me.test.ts          # GET /api/auth/me tests
├── components/
│   └── LoginPage.test.tsx      # Login page component tests
├── lib/
│   └── auth.test.ts            # Authentication helper tests
├── utils/
│   ├── prisma-mock.ts          # Prisma client mock
│   └── test-data-factory.ts   # Test data factories
└── README.md                   # Testing documentation
```

## 🧪 Test Categories

### 1. Unit Tests (`__tests__/lib/`)

**Purpose:** Test individual functions in isolation

**What's Covered:**

- `comparePassword()` - Password comparison with bcrypt
- `hashPassword()` - Password hashing
- `generateSessionToken()` - UUID token generation
- `getSessionExpiration()` - Session expiry calculation
- `validateSessionToken()` - Session validation and cleanup
- `extractSessionToken()` - Token extraction from headers/cookies
- `sanitizeUser()` - User data sanitization
- `createSessionCookie()` - Secure cookie creation
- `clearSessionCookie()` - Cookie clearing

**Test Count:** 20+ unit tests

### 2. API Route Tests (`__tests__/api/`)

**Purpose:** Test HTTP endpoints for correctness

**Login Route (`/api/auth/login`):**

- ✅ Successful login with valid credentials
- ✅ Email normalization (lowercase)
- ✅ Invalid credentials handling (401)
- ✅ Inactive user rejection (401)
- ✅ Email validation errors (400)
- ✅ Password validation errors (400)
- ✅ Database error handling (500)
- ✅ Session creation and cookie setting
- ✅ Last login timestamp update

**Logout Route (`/api/auth/logout`):**

- ✅ Successful logout with token
- ✅ Cookie clearing
- ✅ Missing token handling (401)
- ✅ Non-existent session handling
- ✅ Multiple logout attempts
- ✅ Database error handling

**Me Route (`/api/auth/me`):**

- ✅ Authenticated user retrieval
- ✅ Permission information (admin/manager/agent)
- ✅ Unauthenticated request rejection (401)
- ✅ Expired session handling
- ✅ Inactive user rejection
- ✅ Password sanitization
- ✅ Token extraction (Bearer/Cookie)

**Test Count:** 40+ API tests

### 3. Component Tests (`__tests__/components/`)

**Purpose:** Test UI components and user interactions

**Login Page:**

- ✅ Form rendering (email, password, submit button)
- ✅ Email validation (format, required)
- ✅ Password validation (length, required)
- ✅ Error display and clearing
- ✅ Loading state during submission
- ✅ Successful login flow
- ✅ API error handling
- ✅ Redirect when authenticated
- ✅ Form submission (click, Enter key)
- ✅ Navigation links

**Test Count:** 15+ component tests

## 🛠️ Testing Infrastructure

### Core Dependencies

```json
{
  "jest": "^30.2.0",
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/user-event": "^14.6.1",
  "jest-mock-extended": "^4.0.0",
  "jest-environment-jsdom": "^30.2.0"
}
```

### Configuration Files

**`jest.config.js`:**

- Next.js 14+ App Router support
- TypeScript/TSX transformation
- Path aliases (`@/*`)
- Coverage thresholds (70%)
- jsdom environment for React testing

**`jest.setup.js`:**

- Testing Library matchers
- Next.js router mocking
- Environment variable setup
- Polyfills (TextEncoder/TextDecoder)

### Mock Utilities

**Prisma Mock (`__tests__/utils/prisma-mock.ts`):**

- Deep mock of Prisma Client
- Auto-reset between tests
- Full type safety

**Test Data Factory (`__tests__/utils/test-data-factory.ts`):**

- `createTestUser()` - Generate test users
- `createTestAdmin()` - Generate admin users
- `createTestManager()` - Generate manager users
- `createTestSession()` - Generate sessions
- `createExpiredSession()` - Generate expired sessions
- `createMockRequest()` - Generate mock requests
- `createAuthenticatedRequest()` - Generate authenticated requests
- `createRequestWithCookie()` - Generate cookie-based requests

## 🚀 Running Tests

### Commands

```bash
# Run all tests
npm test

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# CI/CD mode
npm run test:ci
```

### Expected Output

```
Test Suites: 5 passed, 5 total
Tests:       75+ passed, 75+ total
Snapshots:   0 total
Time:        ~10s
Coverage:    >70% across all metrics
```

## 📊 Coverage Requirements

### Global Thresholds

| Metric     | Threshold |
| ---------- | --------- |
| Branches   | 70%       |
| Functions  | 70%       |
| Lines      | 70%       |
| Statements | 70%       |

### Priority Areas

| Area             | Target Coverage |
| ---------------- | --------------- |
| Authentication   | >80%            |
| Authorization    | >80%            |
| API Routes       | >75%            |
| Form Validation  | >75%            |
| Helper Functions | >70%            |

### View Coverage Report

After running `npm run test:coverage`:

```bash
# Open in browser
open coverage/lcov-report/index.html
```

## 🎨 Testing Best Practices

### 1. AAA Pattern (Arrange, Act, Assert)

```typescript
it("should validate email format", () => {
  // Arrange
  const email = "test@example.com";

  // Act
  const isValid = validateEmail(email);

  // Assert
  expect(isValid).toBe(true);
});
```

### 2. Descriptive Test Names

✅ **Good:**

```typescript
it("should return 401 when user provides invalid credentials", () => {});
```

❌ **Bad:**

```typescript
it("login test", () => {});
```

### 3. Test Independence

Each test should run independently. Use `beforeEach` to reset state:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 4. Mock External Dependencies

- ✅ Database (Prisma) - Always mocked
- ✅ bcrypt - Mocked for consistency
- ✅ Next.js router - Mocked
- ✅ fetch - Mock in component tests

### 5. Test Error Cases

Don't just test happy paths:

```typescript
describe("login", () => {
  it("should succeed with valid credentials", () => {});
  it("should fail with invalid credentials", () => {});
  it("should handle network errors", () => {});
  it("should handle malformed responses", () => {});
});
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Pre-commit Hooks

Tests run automatically before commits:

```json
// .husky/pre-commit
#!/bin/sh
npm run test:ci
```

## 📈 Test Metrics

### Current Status

- **Total Tests:** 75+
- **Test Suites:** 5
- **Coverage:** >70% (all metrics)
- **Test Speed:** ~10 seconds
- **Passing Rate:** 100%

### Coverage by Module

| Module               | Coverage |
| -------------------- | -------- |
| `lib/auth.ts`        | ~95%     |
| `/api/auth/login`    | ~90%     |
| `/api/auth/logout`   | ~90%     |
| `/api/auth/me`       | ~90%     |
| `app/login/page.tsx` | ~85%     |

## 🐛 Troubleshooting

### Common Issues

#### 1. Module not found errors

```bash
# Check path aliases in jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### 2. Prisma mock not working

```typescript
// Import mock BEFORE the module
import { prismaMock } from "../utils/prisma-mock";
jest.mock("@/lib/db", () => ({ prisma: prismaMock }));
import { yourFunction } from "@/lib/auth";
```

#### 3. Tests timeout

```typescript
// Increase timeout for slow tests
jest.setTimeout(10000);
```

## 📝 Adding New Tests

### Checklist

- [ ] Place test file in appropriate directory
- [ ] Use `.test.ts` or `.test.tsx` extension
- [ ] Import utilities from `__tests__/utils/`
- [ ] Follow AAA pattern
- [ ] Test error cases
- [ ] Mock external dependencies
- [ ] Add descriptive test names
- [ ] Verify coverage with `npm run test:coverage`

### Example Template

```typescript
// Mock dependencies first
import { prismaMock } from "../utils/prisma-mock";
jest.mock("@/lib/db", () => ({ prisma: prismaMock }));

// Import module under test
import { yourFunction } from "@/lib/your-module";

describe("yourFunction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Success Cases", () => {
    it("should handle valid input", () => {
      // Test implementation
    });
  });

  describe("Error Cases", () => {
    it("should handle invalid input", () => {
      // Test implementation
    });
  });
});
```

## 🎯 Next Steps

### Recommended Test Additions

1. **Middleware Tests**
   - Auth checking
   - Role validation
   - Route protection

2. **Integration Tests**
   - Complete auth flow (login → protected route → logout)
   - Role-based access control flow

3. **Additional Component Tests**
   - Admin dashboard
   - Package management
   - Inquiry handling

4. **End-to-End Tests** (Future)
   - User journeys
   - Critical workflows
   - Cross-browser testing

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Test Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Maintained by:** QA Engineer Agent 🔴
**Last Updated:** 2025-10-02
**Test Suite Version:** 1.0.0
