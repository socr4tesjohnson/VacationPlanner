/**
 * Test Data Factory
 *
 * Factory functions for creating test data objects.
 * These provide consistent, reusable test data across all tests.
 */

import { User, Session, Role } from '@prisma/client'

/**
 * Create a test user with default or custom values
 */
export function createTestUser(overrides?: Partial<User>): User {
  const defaultUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$abcdefghijklmnopqrstuv', // bcrypt hash format
    role: 'AGENT' as Role,
    active: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    lastLogin: null,
  }

  return { ...defaultUser, ...overrides }
}

/**
 * Create a test admin user
 */
export function createTestAdmin(overrides?: Partial<User>): User {
  return createTestUser({
    id: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN' as Role,
    ...overrides,
  })
}

/**
 * Create a test manager user
 */
export function createTestManager(overrides?: Partial<User>): User {
  return createTestUser({
    id: 3,
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'MANAGER' as Role,
    ...overrides,
  })
}

/**
 * Create a test session
 */
export function createTestSession(
  userId: number = 1,
  overrides?: Partial<Session>
): Session {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

  const defaultSession: Session = {
    id: 1,
    userId,
    token: 'test-session-token-' + Math.random().toString(36).substring(7),
    expiresAt,
    createdAt: now,
  }

  return { ...defaultSession, ...overrides }
}

/**
 * Create an expired test session
 */
export function createExpiredSession(
  userId: number = 1,
  overrides?: Partial<Session>
): Session {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

  return createTestSession(userId, {
    expiresAt: yesterday,
    ...overrides,
  })
}

/**
 * Create a mock request with headers
 */
export function createMockRequest(options?: {
  headers?: Record<string, string>
  body?: any
  method?: string
}): Request {
  const headers = new Headers(options?.headers || {})

  return {
    headers,
    json: async () => options?.body || {},
    method: options?.method || 'GET',
  } as Request
}

/**
 * Create a mock request with Bearer token
 */
export function createAuthenticatedRequest(
  token: string,
  options?: {
    body?: any
    method?: string
  }
): Request {
  return createMockRequest({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...options,
  })
}

/**
 * Create a mock request with session cookie
 */
export function createRequestWithCookie(
  token: string,
  options?: {
    body?: any
    method?: string
  }
): Request {
  return createMockRequest({
    headers: {
      Cookie: `session_token=${token}`,
    },
    ...options,
  })
}
