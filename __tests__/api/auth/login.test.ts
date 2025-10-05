/**
 * API Route Tests: POST /api/auth/login
 *
 * Tests the login endpoint including:
 * - Successful login with valid credentials
 * - Invalid credentials handling
 * - Validation errors
 * - Inactive user handling
 * - Session creation
 */

// Mock Prisma first
import { prismaMock } from "../../utils/prisma-mock";

jest.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

// Mock bcrypt for password comparison
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import bcrypt from "bcrypt";

import { POST } from "@/app/api/auth/login/route";
import {
  createTestUser,
  createMockRequest,
} from "../../utils/test-data-factory";
import { NextRequest } from "next/server";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful Login", () => {
    it("should login user with valid credentials", async () => {
      const user = createTestUser({
        email: "test@example.com",
        password: "hashed-password",
        active: true,
      });

      const mockCompare = bcrypt.compare as jest.Mock;
      mockCompare.mockResolvedValue(true);

      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.session.create.mockResolvedValue({
        id: 1,
        userId: user.id,
        token: "new-session-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });
      prismaMock.user.update.mockResolvedValue(user);

      const request = createMockRequest({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "password123",
        },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.password).toBeUndefined(); // Password should be sanitized
      expect(data.session).toBeDefined();
      expect(data.session.token).toBeDefined();

      // Check session cookie is set
      const setCookieHeader = response.headers.get("Set-Cookie");
      expect(setCookieHeader).toContain("session_token=");
      expect(setCookieHeader).toContain("HttpOnly");

      // Verify database operations
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(prismaMock.session.create).toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { lastLogin: expect.any(Date) },
      });
    });

    it("should normalize email to lowercase", async () => {
      const user = createTestUser({
        email: "test@example.com",
        active: true,
      });

      const mockCompare = bcrypt.compare as jest.Mock;
      mockCompare.mockResolvedValue(true);

      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.session.create.mockResolvedValue({
        id: 1,
        userId: user.id,
        token: "token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });
      prismaMock.user.update.mockResolvedValue(user);

      const request = createMockRequest({
        method: "POST",
        body: {
          email: "TEST@EXAMPLE.COM",
          password: "password123",
        },
      }) as NextRequest;

      await POST(request);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  describe("Invalid Credentials", () => {
    it("should return 401 for non-existent user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        method: "POST",
        body: {
          email: "nonexistent@example.com",
          password: "password123",
        },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid email or password");
    });

    it("should return 401 for wrong password", async () => {
      const user = createTestUser({
        email: "test@example.com",
        active: true,
      });

      const mockCompare = bcrypt.compare as jest.Mock;
      mockCompare.mockResolvedValue(false);

      prismaMock.user.findUnique.mockResolvedValue(user);

      const request = createMockRequest({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "wrongpassword",
        },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid email or password");
      expect(prismaMock.session.create).not.toHaveBeenCalled();
    });

    it("should return 401 for inactive user", async () => {
      const user = createTestUser({
        email: "test@example.com",
        active: false, // Inactive user
      });

      prismaMock.user.findUnique.mockResolvedValue(user);

      const request = createMockRequest({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "password123",
        },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Account is inactive. Please contact support.");
      expect(prismaMock.session.create).not.toHaveBeenCalled();
    });
  });

  describe("Validation Errors", () => {
    it("should return 400 for invalid email format", async () => {
      const request = createMockRequest({
        method: "POST",
        body: {
          email: "not-an-email",
          password: "password123",
        },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
      expect(data.details[0].path).toContain("email");
    });

    it("should return 400 for missing email", async () => {
      const request = createMockRequest({
        method: "POST",
        body: {
          password: "password123",
        },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("should return 400 for missing password", async () => {
      const request = createMockRequest({
        method: "POST",
        body: {
          email: "test@example.com",
        },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("should return 400 for empty password", async () => {
      const request = createMockRequest({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "",
        },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
    });
  });

  describe("Error Handling", () => {
    it("should return 500 for database errors", async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error("Database error"));

      const request = createMockRequest({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "password123",
        },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("An error occurred during login");
    });

    it("should handle malformed JSON", async () => {
      const request = {
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("An error occurred during login");
    });
  });
});
