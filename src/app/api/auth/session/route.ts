import { NextRequest, NextResponse } from "next/server";
import {
  extractSessionToken,
  validateSessionToken,
  sanitizeUser,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Extract session token from request
    const token = extractSessionToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "No session token provided" },
        { status: 401 }
      );
    }

    // Validate the session token
    const user = await validateSessionToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired session token" },
        { status: 401 }
      );
    }

    // Check if user is still active
    if (!user.active) {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 401 }
      );
    }

    // Return sanitized user info
    return NextResponse.json(
      {
        success: true,
        user: sanitizeUser(user),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "An error occurred during session validation" },
      { status: 500 }
    );
  }
}
