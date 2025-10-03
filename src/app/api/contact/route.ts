import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateRecommendations } from "@/lib/ai-agent";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  packageId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  flexible: z.boolean().default(true),
  adults: z.number().min(1).default(2),
  children: z.number().min(0).default(0),
  budgetRange: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Create contact inquiry in database
    const inquiry = await prisma.contactInquiry.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        packageId: validatedData.packageId || null,
        packageTitle: null,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        flexible: validatedData.flexible,
        adults: validatedData.adults,
        children: validatedData.children,
        childAges: JSON.stringify([]),
        budgetRange: validatedData.budgetRange || null,
        message: validatedData.message,
        status: "new",
        source: request.headers.get("referer") || null,
        userAgent: request.headers.get("user-agent") || null,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          null,
      },
    });

    // Generate AI-powered package recommendations
    const recommendations = await generateRecommendations({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      flexible: validatedData.flexible,
      adults: validatedData.adults,
      children: validatedData.children,
      budgetRange: validatedData.budgetRange,
      message: validatedData.message,
    });

    // TODO: Send email notification (when email service is configured)
    // await sendContactEmail(inquiry, recommendations);

    return NextResponse.json(
      {
        success: true,
        message: "Contact inquiry submitted successfully",
        inquiryId: inquiry.id,
        recommendations,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form data: " + error.issues.map(e => e.message).join(", "),
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to submit contact inquiry";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
