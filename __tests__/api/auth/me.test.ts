/**
 * API Route Tests: GET /api/auth/me
 *
 * Tests the current user endpoint including:
 * - Authenticated user retrieval
 * - Unauthenticated requests
 * - Expired sessions
 * - Inactive users
 * - Permission information
 */

// Mock Prisma first
import { prismaMock } from '../../utils/prisma-mock'

jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))

import { GET } from '@/app/api/auth/me/route'
import {
  createTestUser,
  createTestAdmin,
  createTestManager,
  createTestSession,
  createExpiredSession,
  createAuthenticatedRequest,
  createMockRequest,
} from '../../utils/test-data-factory'
import { NextRequest } from 'next/server'

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authenticated Requests', () => {
    it('should return user info for valid session', async () => {
      const user = createTestUser({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'AGENT',
        active: true,
      })
      const session = createTestSession(user.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user,
      })

      const request = createAuthenticatedRequest(session.token) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.id).toBe(1)
      expect(data.user.email).toBe('test@example.com')
      expect(data.user.name).toBe('Test User')
      expect(data.user.password).toBeUndefined() // Password should be sanitized
    })

    it('should include admin permissions for admin user', async () => {
      const adminUser = createTestAdmin()
      const session = createTestSession(adminUser.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user: adminUser,
      })

      const request = createAuthenticatedRequest(session.token) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.permissions).toBeDefined()
      expect(data.user.permissions.isAdmin).toBe(true)
      expect(data.user.permissions.isManager).toBe(false)
      expect(data.user.permissions.isAgent).toBe(false)
    })

    it('should include manager permissions for manager user', async () => {
      const managerUser = createTestManager()
      const session = createTestSession(managerUser.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user: managerUser,
      })

      const request = createAuthenticatedRequest(session.token) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.permissions.isAdmin).toBe(false)
      expect(data.user.permissions.isManager).toBe(true)
      expect(data.user.permissions.isAgent).toBe(false)
    })

    it('should include agent permissions for agent user', async () => {
      const agentUser = createTestUser({ role: 'AGENT' })
      const session = createTestSession(agentUser.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user: agentUser,
      })

      const request = createAuthenticatedRequest(session.token) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.permissions.isAdmin).toBe(false)
      expect(data.user.permissions.isManager).toBe(false)
      expect(data.user.permissions.isAgent).toBe(true)
    })
  })

  describe('Unauthenticated Requests', () => {
    it('should return 401 when no token provided', async () => {
      const request = createMockRequest() as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
      expect(data.user).toBeUndefined()

      expect(prismaMock.session.findUnique).not.toHaveBeenCalled()
    })

    it('should return 401 for invalid token', async () => {
      prismaMock.session.findUnique.mockResolvedValue(null)

      const request = createAuthenticatedRequest('invalid-token') as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid or expired session')
    })

    it('should return 401 for expired session', async () => {
      const user = createTestUser()
      const expiredSession = createExpiredSession(user.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...expiredSession,
        user,
      })

      const request = createAuthenticatedRequest(
        expiredSession.token
      ) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid or expired session')

      // Session should be deleted
      expect(prismaMock.session.delete).toHaveBeenCalledWith({
        where: { id: expiredSession.id },
      })
    })
  })

  describe('Inactive User Handling', () => {
    it('should return 401 for inactive user', async () => {
      const inactiveUser = createTestUser({ active: false })
      const session = createTestSession(inactiveUser.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user: inactiveUser,
      })

      const request = createAuthenticatedRequest(session.token) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Account is inactive')
    })

    it('should allow active user with same session', async () => {
      const activeUser = createTestUser({ active: true })
      const session = createTestSession(activeUser.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user: activeUser,
      })

      const request = createAuthenticatedRequest(session.token) as NextRequest

      const response = await GET(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Data Sanitization', () => {
    it('should not return password in response', async () => {
      const user = createTestUser({
        password: 'super-secret-hash',
      })
      const session = createTestSession(user.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user,
      })

      const request = createAuthenticatedRequest(session.token) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(data.user.password).toBeUndefined()
      expect(JSON.stringify(data)).not.toContain('super-secret-hash')
    })

    it('should return all safe user fields', async () => {
      const user = createTestUser({
        id: 42,
        email: 'user@test.com',
        name: 'John Doe',
        role: 'ADMIN',
        active: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        lastLogin: new Date('2024-01-03'),
      })
      const session = createTestSession(user.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user,
      })

      const request = createAuthenticatedRequest(session.token) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(data.user.id).toBe(42)
      expect(data.user.email).toBe('user@test.com')
      expect(data.user.name).toBe('John Doe')
      expect(data.user.role).toBe('ADMIN')
      expect(data.user.active).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for database errors', async () => {
      prismaMock.session.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = createAuthenticatedRequest('valid-token') as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe(
        'An error occurred while fetching user information'
      )
    })

    it('should handle unexpected errors gracefully', async () => {
      prismaMock.session.findUnique.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const request = createAuthenticatedRequest('token') as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })

  describe('Token Extraction', () => {
    it('should work with Bearer token in Authorization header', async () => {
      const user = createTestUser()
      const session = createTestSession(user.id, { token: 'bearer-token' })

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user,
      })

      const request = createMockRequest({
        headers: {
          Authorization: 'Bearer bearer-token',
        },
      }) as NextRequest

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
        where: { token: 'bearer-token' },
        include: { user: true },
      })
    })

    it('should work with session cookie', async () => {
      const user = createTestUser()
      const session = createTestSession(user.id, { token: 'cookie-token' })

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user,
      })

      const request = createMockRequest({
        headers: {
          Cookie: 'session_token=cookie-token',
        },
      }) as NextRequest

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
        where: { token: 'cookie-token' },
        include: { user: true },
      })
    })
  })
})
