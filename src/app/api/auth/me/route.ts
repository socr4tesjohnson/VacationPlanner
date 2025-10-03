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
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate the session token and get user
    const user = await validateSessionToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
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

    // Return sanitized user info with role information
    return NextResponse.json(
      {
        success: true,
        user: {
          ...sanitizeUser(user),
          // Explicitly include role information for clarity
          permissions: {
            isAdmin: user.role === "ADMIN",
            isManager: user.role === "MANAGER",
            isAgent: user.role === "AGENT",
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user information" },
      { status: 500 }
    );
  }
}
