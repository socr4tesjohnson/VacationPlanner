/**
 * Mock Prisma Client for Testing
 *
 * This mock provides a complete Prisma client implementation for tests,
 * allowing us to test database operations without hitting a real database.
 */

import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

// Reset mock before each test
beforeEach(() => {
  mockReset(prismaMock)
})

// Export for use in tests
export default prismaMock
