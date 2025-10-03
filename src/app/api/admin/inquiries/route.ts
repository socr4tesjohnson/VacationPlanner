import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withMiddleware, requireAuth } from "@/lib/middleware";

async function handleGET(request: NextRequest) {
  try {
    // Fetch all inquiries sorted by most recent
    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      inquiries,
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// Export with authentication middleware (all authenticated users can view inquiries)
export const GET = withMiddleware(handleGET, requireAuth());
