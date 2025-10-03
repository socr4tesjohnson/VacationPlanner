/**
 * Unit Tests for Authentication Helper Functions
 *
 * Tests all auth utility functions including password hashing,
 * token generation, session validation, and user sanitization.
 */

// Mock Prisma first
import { prismaMock } from '../utils/prisma-mock'

jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))

// Mock bcrypt for consistent testing
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

import bcrypt from 'bcrypt'

import {
  comparePassword,
  hashPassword,
  generateSessionToken,
  getSessionExpiration,
  validateSessionToken,
  extractSessionToken,
  sanitizeUser,
  createSessionCookie,
  clearSessionCookie,
} from '@/lib/auth'
import {
  createTestUser,
  createTestSession,
  createExpiredSession,
  createAuthenticatedRequest,
  createRequestWithCookie,
  createMockRequest,
} from '../utils/test-data-factory'

describe('Auth Helper Functions', () => {
  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const mockCompare = bcrypt.compare as jest.Mock
      mockCompare.mockResolvedValue(true)

      const result = await comparePassword('password123', 'hashedPassword')

      expect(result).toBe(true)
      expect(mockCompare).toHaveBeenCalledWith('password123', 'hashedPassword')
    })

    it('should return false for non-matching passwords', async () => {
      const mockCompare = bcrypt.compare as jest.Mock
      mockCompare.mockResolvedValue(false)

      const result = await comparePassword('wrongPassword', 'hashedPassword')

      expect(result).toBe(false)
    })
  })

  describe('hashPassword', () => {
    it('should hash a password with salt rounds', async () => {
      const mockHash = bcrypt.hash as jest.Mock
      mockHash.mockResolvedValue('hashedPassword')

      const result = await hashPassword('password123')

      expect(result).toBe('hashedPassword')
      expect(mockHash).toHaveBeenCalledWith('password123', 10)
    })
  })

  describe('generateSessionToken', () => {
    it('should generate a valid UUID token', () => {
      const token = generateSessionToken()

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      expect(token).toMatch(uuidRegex)
    })

    it('should generate unique tokens', () => {
      const token1 = generateSessionToken()
      const token2 = generateSessionToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe('getSessionExpiration', () => {
    it('should return a date 7 days in the future', () => {
      const now = new Date()
      const expiration = getSessionExpiration()

      const diffInDays =
        (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

      expect(diffInDays).toBeCloseTo(7, 1)
    })
  })

  describe('validateSessionToken', () => {
    it('should return null for empty token', async () => {
      const result = await validateSessionToken('')

      expect(result).toBeNull()
    })

    it('should return null for non-existent session', async () => {
      prismaMock.session.findUnique.mockResolvedValue(null)

      const result = await validateSessionToken('invalid-token')

      expect(result).toBeNull()
      expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
        where: { token: 'invalid-token' },
        include: { user: true },
      })
    })

    it('should return user for valid session', async () => {
      const user = createTestUser()
      const session = createTestSession(user.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...session,
        user,
      })

      const result = await validateSessionToken(session.token)

      expect(result).toEqual(user)
    })

    it('should delete and return null for expired session', async () => {
      const user = createTestUser()
      const expiredSession = createExpiredSession(user.id)

      prismaMock.session.findUnique.mockResolvedValue({
        ...expiredSession,
        user,
      })

      const result = await validateSessionToken(expiredSession.token)

      expect(result).toBeNull()
      expect(prismaMock.session.delete).toHaveBeenCalledWith({
        where: { id: expiredSession.id },
      })
    })
  })

  describe('extractSessionToken', () => {
    it('should extract token from Authorization header', () => {
      const request = createAuthenticatedRequest('my-test-token')

      const token = extractSessionToken(request)

      expect(token).toBe('my-test-token')
    })

    it('should extract token from cookie', () => {
      const request = createRequestWithCookie('my-cookie-token')

      const token = extractSessionToken(request)

      expect(token).toBe('my-cookie-token')
    })

    it('should prioritize Authorization header over cookie', () => {
      const request = createMockRequest({
        headers: {
          Authorization: 'Bearer header-token',
          Cookie: 'session_token=cookie-token',
        },
      })

      const token = extractSessionToken(request)

      expect(token).toBe('header-token')
    })

    it('should return null when no token is present', () => {
      const request = createMockRequest()

      const token = extractSessionToken(request)

      expect(token).toBeNull()
    })

    it('should handle multiple cookies correctly', () => {
      const request = createMockRequest({
        headers: {
          Cookie: 'other_cookie=value; session_token=my-token; another=value',
        },
      })

      const token = extractSessionToken(request)

      expect(token).toBe('my-token')
    })
  })

  describe('sanitizeUser', () => {
    it('should remove password from user object', () => {
      const user = createTestUser({
        password: 'secret-password',
      })

      const sanitized = sanitizeUser(user)

      expect(sanitized).not.toHaveProperty('password')
      expect(sanitized).toHaveProperty('id')
      expect(sanitized).toHaveProperty('email')
      expect(sanitized).toHaveProperty('name')
      expect(sanitized).toHaveProperty('role')
    })

    it('should preserve all other user fields', () => {
      const user = createTestUser({
        id: 42,
        email: 'test@test.com',
        name: 'Test User',
        role: 'ADMIN',
      })

      const sanitized = sanitizeUser(user)

      expect(sanitized.id).toBe(42)
      expect(sanitized.email).toBe('test@test.com')
      expect(sanitized.name).toBe('Test User')
      expect(sanitized.role).toBe('ADMIN')
    })
  })

  describe('createSessionCookie', () => {
    it('should create headers with secure cookie', () => {
      const token = 'my-session-token'
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      const headers = createSessionCookie(token, expiresAt)

      const setCookie = headers.get('Set-Cookie')
      expect(setCookie).toBeTruthy()
      expect(setCookie).toContain('session_token=my-session-token')
      expect(setCookie).toContain('HttpOnly')
      expect(setCookie).toContain('Secure')
      expect(setCookie).toContain('SameSite=Strict')
      expect(setCookie).toContain('Path=/')
      expect(setCookie).toContain('Max-Age=')
    })

    it('should calculate correct Max-Age', () => {
      const token = 'test-token'
      const expiresAt = new Date(Date.now() + 3600 * 1000) // 1 hour

      const headers = createSessionCookie(token, expiresAt)

      const setCookie = headers.get('Set-Cookie')!
      const maxAgeMatch = setCookie.match(/Max-Age=(\d+)/)

      expect(maxAgeMatch).toBeTruthy()
      const maxAge = parseInt(maxAgeMatch![1])
      expect(maxAge).toBeGreaterThan(3500) // ~1 hour
      expect(maxAge).toBeLessThan(3700)
    })
  })

  describe('clearSessionCookie', () => {
    it('should create headers to clear cookie', () => {
      const headers = clearSessionCookie()

      const setCookie = headers.get('Set-Cookie')
      expect(setCookie).toBeTruthy()
      expect(setCookie).toContain('session_token=')
      expect(setCookie).toContain('Max-Age=0')
      expect(setCookie).toContain('HttpOnly')
      expect(setCookie).toContain('Secure')
    })
  })
})
