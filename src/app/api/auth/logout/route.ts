import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractSessionToken, clearSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Extract session token from request
    const token = extractSessionToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "No session token provided" },
        { status: 401 }
      );
    }

    // Find and delete the session
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) {
      // Token doesn't exist, but we'll still clear the cookie
      const headers = clearSessionCookie();
      headers.set("Content-Type", "application/json");

      return NextResponse.json(
        { success: true, message: "Session not found, but logged out" },
        { status: 200, headers }
      );
    }

    // Delete the session from database
    await prisma.session.delete({
      where: { id: session.id },
    });

    // Clear session cookie
    const headers = clearSessionCookie();
    headers.set("Content-Type", "application/json");

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
