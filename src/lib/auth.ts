import bcrypt from "bcrypt";
import { prisma } from "./db";
import { User } from "@prisma/client";

/**
 * Compare a plain text password with a bcrypt hash
 * @param password - The plain text password to check
 * @param hash - The bcrypt hash to compare against
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Hash a password using bcrypt
 * @param password - The plain text password to hash
 * @returns Promise<string> - The bcrypt hash
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Generate a secure session token
 * @returns string - A secure random token
 */
export function generateSessionToken(): string {
  return crypto.randomUUID();
}

/**
 * Get session expiration date (7 days from now)
 * @returns Date - Expiration date 7 days in the future
 */
export function getSessionExpiration(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
}

/**
 * Validate a session token and return the associated user
 * @param token - The session token to validate
 * @returns Promise<User | null> - The user if token is valid, null otherwise
 */
export async function validateSessionToken(
  token: string
): Promise<User | null> {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

/**
 * Extract session token from Authorization header or cookies
 * @param request - The Next.js request object
 * @returns string | null - The token if found, null otherwise
 */
export function extractSessionToken(request: Request): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );
    return cookies["session_token"] || null;
  }

  return null;
}

/**
 * Remove sensitive fields from user object
 * @param user - The user object to sanitize
 * @returns Sanitized user object without password
 */
export function sanitizeUser(user: User) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Create response headers for setting session cookie
 * @param token - The session token
 * @param expiresAt - The expiration date
 * @returns Headers object with Set-Cookie header
 */
export function createSessionCookie(token: string, expiresAt: Date): Headers {
  const headers = new Headers();
  const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

  // Set secure cookie
  headers.set(
    "Set-Cookie",
    `session_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
  );

  return headers;
}

/**
 * Create response headers for clearing session cookie
 * @returns Headers object with Set-Cookie header to clear cookie
 */
export function clearSessionCookie(): Headers {
  const headers = new Headers();
  headers.set(
    "Set-Cookie",
    "session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
  );
  return headers;
}
