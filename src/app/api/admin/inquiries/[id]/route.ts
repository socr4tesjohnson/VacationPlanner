import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withMiddleware, requireAuth } from "@/lib/middleware";

async function handleGET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: params.id },
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiry" },
      { status: 500 }
    );
  }
}

async function handlePATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["new", "contacted", "quoted", "booked", "closed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const inquiry = await prisma.contactInquiry.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

// Export handlers with authentication middleware
export const GET = withMiddleware(handleGET, requireAuth());
export const PATCH = withMiddleware(handlePATCH, requireAuth());
