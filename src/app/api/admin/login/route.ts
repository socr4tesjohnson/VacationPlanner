import { NextRequest, NextResponse } from "next/server";

// Simple password-based authentication
// In production, use proper authentication like NextAuth.js
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`admin:${Date.now()}`).toString("base64");

      return NextResponse.json({
        success: true,
        token,
        message: "Login successful",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid password",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
      },
      { status: 500 }
    );
  }
}
