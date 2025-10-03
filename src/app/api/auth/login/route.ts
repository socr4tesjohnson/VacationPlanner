import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  comparePassword,
  generateSessionToken,
  getSessionExpiration,
  sanitizeUser,
  createSessionCookie,
} from "@/lib/auth";

// Validation schema for login request
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.active) {
      return NextResponse.json(
        { error: "Account is inactive. Please contact support." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate session token
    const token = generateSessionToken();
    const expiresAt = getSessionExpiration();

    // Create session in database
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Update user's last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create response with session cookie
    const headers = createSessionCookie(token, expiresAt);
    headers.set("Content-Type", "application/json");

    // Return user info (without password) and session token
    return NextResponse.json(
      {
        success: true,
        user: sanitizeUser(user),
        session: {
          token,
          expiresAt: expiresAt.toISOString(),
        },
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
