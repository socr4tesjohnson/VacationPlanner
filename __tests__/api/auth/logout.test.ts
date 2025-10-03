/**
 * API Route Tests: POST /api/auth/logout
 *
 * Tests the logout endpoint including:
 * - Successful logout with valid token
 * - Logout without token
 * - Non-existent session handling
 * - Cookie clearing
 */

// Mock Prisma first
import { prismaMock } from '../../utils/prisma-mock'

jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))

import { POST } from '@/app/api/auth/logout/route'
import {
  createTestSession,
  createAuthenticatedRequest,
  createRequestWithCookie,
  createMockRequest,
} from '../../utils/test-data-factory'
import { NextRequest } from 'next/server'

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Successful Logout', () => {
    it('should logout with valid Bearer token', async () => {
      const session = createTestSession(1, { token: 'valid-token' })

      prismaMock.session.findUnique.mockResolvedValue(session)
      prismaMock.session.delete.mockResolvedValue(session)

      const request = createAuthenticatedRequest('valid-token', {
        method: 'POST',
      }) as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Logged out successfully')

      // Verify session was deleted
      expect(prismaMock.session.delete).toHaveBeenCalledWith({
        where: { id: session.id },
      })

      // Verify cookie is cleared
      const setCookieHeader = response.headers.get('Set-Cookie')
      expect(setCookieHeader).toContain('session_token=')
      expect(setCookieHeader).toContain('Max-Age=0')
    })

    it('should logout with session cookie', async () => {
      const session = createTestSession(1, { token: 'cookie-token' })

      prismaMock.session.findUnique.mockResolvedValue(session)
      prismaMock.session.delete.mockResolvedValue(session)

      const request = createRequestWithCookie('cookie-token', {
        method: 'POST',
      }) as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      expect(prismaMock.session.delete).toHaveBeenCalledWith({
        where: { id: session.id },
      })
    })
  })

  describe('Missing Token', () => {
    it('should return 401 when no token is provided', async () => {
      const request = createMockRequest({
        method: 'POST',
      }) as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('No session token provided')

      // Should not attempt to delete anything
      expect(prismaMock.session.findUnique).not.toHaveBeenCalled()
      expect(prismaMock.session.delete).not.toHaveBeenCalled()
    })
  })

  describe('Non-existent Session', () => {
    it('should handle logout for non-existent session gracefully', async () => {
      prismaMock.session.findUnique.mockResolvedValue(null)

      const request = createAuthenticatedRequest('non-existent-token', {
        method: 'POST',
      }) as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Session not found, but logged out')

      // Should still clear the cookie
      const setCookieHeader = response.headers.get('Set-Cookie')
      expect(setCookieHeader).toContain('Max-Age=0')

      // Should not attempt to delete
      expect(prismaMock.session.delete).not.toHaveBeenCalled()
    })
  })

  describe('Cookie Clearing', () => {
    it('should set proper cookie clearing headers', async () => {
      const session = createTestSession(1)

      prismaMock.session.findUnique.mockResolvedValue(session)
      prismaMock.session.delete.mockResolvedValue(session)

      const request = createAuthenticatedRequest(session.token, {
        method: 'POST',
      }) as NextRequest

      const response = await POST(request)
      const setCookieHeader = response.headers.get('Set-Cookie')

      expect(setCookieHeader).toBeTruthy()
      expect(setCookieHeader).toContain('session_token=')
      expect(setCookieHeader).toContain('Max-Age=0')
      expect(setCookieHeader).toContain('HttpOnly')
      expect(setCookieHeader).toContain('Secure')
      expect(setCookieHeader).toContain('SameSite=Strict')
      expect(setCookieHeader).toContain('Path=/')
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for database errors', async () => {
      prismaMock.session.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = createAuthenticatedRequest('token', {
        method: 'POST',
      }) as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('An error occurred during logout')
    })

    it('should handle deletion errors gracefully', async () => {
      const session = createTestSession(1)

      prismaMock.session.findUnique.mockResolvedValue(session)
      prismaMock.session.delete.mockRejectedValue(new Error('Delete failed'))

      const request = createAuthenticatedRequest(session.token, {
        method: 'POST',
      }) as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('An error occurred during logout')
    })
  })

  describe('Multiple Logouts', () => {
    it('should handle multiple logout attempts for same session', async () => {
      const session = createTestSession(1, { token: 'token' })

      // First logout - session exists
      prismaMock.session.findUnique.mockResolvedValueOnce(session)
      prismaMock.session.delete.mockResolvedValueOnce(session)

      const request1 = createAuthenticatedRequest('token', {
        method: 'POST',
      }) as NextRequest

      const response1 = await POST(request1)
      expect(response1.status).toBe(200)

      // Second logout - session already deleted
      prismaMock.session.findUnique.mockResolvedValueOnce(null)

      const request2 = createAuthenticatedRequest('token', {
        method: 'POST',
      }) as NextRequest

      const response2 = await POST(request2)
      const data2 = await response2.json()

      expect(response2.status).toBe(200)
      expect(data2.message).toBe('Session not found, but logged out')
    })
  })
})
