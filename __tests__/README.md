# Testing Guide for Vacation Planner

This directory contains comprehensive tests for the Vacation Planner application. The testing suite covers unit tests, API route tests, and component tests.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing New Tests](#writing-new-tests)
- [Testing Best Practices](#testing-best-practices)
- [Mock Data and Utilities](#mock-data-and-utilities)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD Integration](#cicd-integration)

## Overview

The testing infrastructure uses:

- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities
- **jest-mock-extended** - Deep mocking for Prisma
- **@testing-library/user-event** - User interaction simulation

### Test Coverage

Current test coverage includes:

- ✅ Authentication helper functions (`src/lib/auth.ts`)
- ✅ API routes (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`)
- ✅ Login page component
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

## Running Tests

### Run All Tests

```bash
npm test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### CI/CD Mode

```bash
npm run test:ci
```

## Test Structure

```
__tests__/
├── api/
│   └── auth/
│       ├── login.test.ts       # Login API route tests
│       ├── logout.test.ts      # Logout API route tests
│       └── me.test.ts          # Current user API route tests
├── components/
│   └── LoginPage.test.tsx      # Login page component tests
├── lib/
│   └── auth.test.ts            # Auth helper function tests
├── utils/
│   ├── prisma-mock.ts          # Prisma client mock setup
│   └── test-data-factory.ts   # Test data factory functions
└── README.md                   # This file
```

## Writing New Tests

### Unit Tests

Unit tests verify individual functions in isolation. Example:

```typescript
import { yourFunction } from "@/lib/your-module";

describe("yourFunction", () => {
  it("should do something specific", () => {
    const result = yourFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### API Route Tests

API route tests verify endpoint behavior including success cases, error handling, and validation:

```typescript
import { POST } from "@/app/api/your-route/route";
import { prismaMock } from "../../utils/prisma-mock";
import { NextRequest } from "next/server";

describe("POST /api/your-route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle request successfully", async () => {
    // Setup mocks
    prismaMock.model.findUnique.mockResolvedValue(mockData);

    // Create request
    const request = createMockRequest({
      method: "POST",
      body: { data: "value" },
    }) as NextRequest;

    // Execute
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toMatchObject({ success: true });
  });
});
```

### Component Tests

Component tests verify UI behavior and user interactions:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import YourComponent from '@/components/YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const mockHandler = jest.fn()
    render(<YourComponent onSubmit={mockHandler} />)

    const button = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(button)

    expect(mockHandler).toHaveBeenCalled()
  })
})
```

## Testing Best Practices

### 1. Follow AAA Pattern (Arrange, Act, Assert)

```typescript
it("should calculate total correctly", () => {
  // Arrange
  const items = [10, 20, 30];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(60);
});
```

### 2. Test Error Cases, Not Just Happy Paths

```typescript
describe("validateInput", () => {
  it("should accept valid input", () => {
    expect(validateInput("valid")).toBe(true);
  });

  it("should reject empty input", () => {
    expect(validateInput("")).toBe(false);
  });

  it("should reject null input", () => {
    expect(validateInput(null)).toBe(false);
  });
});
```

### 3. Use Descriptive Test Names

✅ **Good:**

```typescript
it("should return 401 when user provides invalid credentials", () => {});
```

❌ **Bad:**

```typescript
it("test login", () => {});
```

### 4. Keep Tests Independent

Each test should be able to run independently without relying on other tests. Use `beforeEach` to reset state:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 5. Mock External Dependencies

Always mock:

- Database calls (Prisma)
- API requests (fetch)
- Third-party libraries
- File system operations

### 6. Test One Thing at a Time

Each test should verify a single behavior or outcome.

## Mock Data and Utilities

### Test Data Factory

Use factory functions to create consistent test data:

```typescript
import { createTestUser, createTestSession } from "../utils/test-data-factory";

const user = createTestUser({ email: "custom@example.com" });
const session = createTestSession(user.id);
```

Available factory functions:

- `createTestUser(overrides?)` - Create a test user
- `createTestAdmin(overrides?)` - Create an admin user
- `createTestManager(overrides?)` - Create a manager user
- `createTestSession(userId, overrides?)` - Create a session
- `createExpiredSession(userId, overrides?)` - Create expired session
- `createMockRequest(options?)` - Create a mock request
- `createAuthenticatedRequest(token, options?)` - Create authenticated request
- `createRequestWithCookie(token, options?)` - Create request with cookie

### Prisma Mock

The Prisma client is automatically mocked in all tests:

```typescript
import { prismaMock } from "../utils/prisma-mock";

// Mock database responses
prismaMock.user.findUnique.mockResolvedValue(user);
prismaMock.session.create.mockResolvedValue(session);
```

## Coverage Requirements

### Coverage Thresholds

The project requires minimum 70% coverage across all metrics:

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

### View Coverage Report

After running `npm run test:coverage`, open:

```
coverage/lcov-report/index.html
```

### Focus Areas for Coverage

Priority areas that must maintain high coverage:

1. **Authentication** (>80% required)
   - Login/logout flows
   - Session management
   - Token validation

2. **Authorization** (>80% required)
   - Role-based access control
   - Middleware protection
   - Permission checks

3. **Form Validation** (>75% required)
   - Input validation
   - Error messages
   - Edge cases

4. **API Routes** (>75% required)
   - Success responses
   - Error handling
   - Validation logic

## CI/CD Integration

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

### Pre-commit Hook

Tests can be added to pre-commit hooks:

```json
// .husky/pre-commit
npm run test:ci
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@/...'"

Make sure path aliases are configured correctly in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### 2. "ReferenceError: fetch is not defined"

Ensure you're using Node 18+ or polyfill fetch for tests.

#### 3. "Prisma mock not working"

Import the Prisma mock before the module under test:

```typescript
import { prismaMock } from "../utils/prisma-mock";
import { yourFunction } from "@/lib/your-module";
```

#### 4. "Tests timeout"

Increase Jest timeout in problematic tests:

```typescript
jest.setTimeout(10000); // 10 seconds
```

## Adding New Test Files

When creating new test files:

1. Place them in the appropriate directory under `__tests__/`
2. Use `.test.ts` or `.test.tsx` extension
3. Import necessary utilities from `__tests__/utils/`
4. Follow existing patterns for consistency
5. Add test coverage for critical paths

## Best Practices Checklist

Before submitting a PR, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Coverage meets minimum thresholds (`npm run test:coverage`)
- [ ] Tests follow AAA pattern
- [ ] Test names are descriptive
- [ ] Error cases are tested
- [ ] External dependencies are mocked
- [ ] No console errors in tests
- [ ] Tests are independent (can run in any order)

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Questions or Issues?**

If you encounter problems with the test suite, please:

1. Check this README
2. Review existing test files for examples
3. Open an issue with detailed error messages
