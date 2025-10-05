import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withMiddleware, requireAuth } from "@/lib/middleware";

async function handleGET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Convert Decimal fields to numbers for JSON serialization
    // Using type assertion to handle optional fields that may not be in older Prisma client
    const inquiryData: any = inquiry;
    const quotedAmount = inquiryData.quotedAmount ? Number(inquiryData.quotedAmount) : null;
    const commissionRate = inquiryData.commissionRate ? Number(inquiryData.commissionRate) : null;
    const commissionAmount = inquiryData.commissionAmount ? Number(inquiryData.commissionAmount) : null;

    return NextResponse.json({
      success: true,
      inquiry: {
        ...inquiry,
        quotedAmount,
        commissionRate,
        commissionAmount,
      },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      notes,
      quotedAmount,
      commissionRate,
      commissionAmount,
      checklist,
    } = body;

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ["new", "contacted", "quoted", "booked", "closed"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    // Build dynamic update object with only provided fields
    const updateData: {
      status?: string;
      notes?: string;
      quotedAmount?: number;
      commissionRate?: number;
      commissionAmount?: number;
      checklist?: string;
    } = {};

    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (quotedAmount !== undefined) updateData.quotedAmount = quotedAmount;
    if (commissionRate !== undefined)
      updateData.commissionRate = commissionRate;
    if (commissionAmount !== undefined)
      updateData.commissionAmount = commissionAmount;
    if (checklist !== undefined) updateData.checklist = checklist;

    const inquiry = await prisma.contactInquiry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      inquiry: {
        ...inquiry,
        quotedAmount: inquiry.quotedAmount?.toNumber() ?? null,
        commissionRate: inquiry.commissionRate?.toNumber() ?? null,
        commissionAmount: inquiry.commissionAmount?.toNumber() ?? null,
      },
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
