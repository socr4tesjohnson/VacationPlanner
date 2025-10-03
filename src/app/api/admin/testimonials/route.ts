import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  withMiddleware,
  requireAuth,
  requireRole,
  getUserFromRequest,
} from "@/lib/middleware";
import { z } from "zod";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/testimonials
 * Admin endpoint for all testimonials (approved and unapproved)
 * Requires: Authentication (any authenticated user)
 */
async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filter parameters
    const approved = searchParams.get("approved");
    const featured = searchParams.get("featured");
    const active = searchParams.get("active");
    const rating = searchParams.get("rating");

    // Sort parameters
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause - no restrictions for admin
    const where: any = {};

    if (approved !== null && approved !== undefined && approved !== "") {
      where.approved = approved === "true";
    }

    if (featured !== null && featured !== undefined && featured !== "") {
      where.featured = featured === "true";
    }

    if (active !== null && active !== undefined && active !== "") {
      where.active = active === "true";
    }

    if (rating) {
      const ratingNum = parseInt(rating, 10);
      if (ratingNum >= 1 && ratingNum <= 5) {
        where.rating = ratingNum;
      }
    }

    // Build orderBy clause
    let orderBy: any = {};
    if (
      sortBy === "rating" ||
      sortBy === "travelDate" ||
      sortBy === "customerName"
    ) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Fetch testimonials with related data
    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          package: {
            select: {
              id: true,
              title: true,
              destination: true,
              type: true,
            },
          },
        },
      }),
      prisma.testimonial.count({ where }),
    ]);

    // Format dates for JSON response
    const formattedTestimonials = testimonials.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      travelDate: t.travelDate?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      testimonials: formattedTestimonials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/testimonials
 * Create a new testimonial
 * Requires: ADMIN or AGENT role
 */
async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const testimonialSchema = z.object({
      customerName: z.string().min(1),
      customerId: z.string().uuid().optional().nullable(),
      customerLocation: z.string().optional().nullable(),
      packageId: z.string().uuid().optional().nullable(),
      rating: z.number().int().min(1).max(5),
      title: z.string().min(1),
      content: z.string().min(1),
      travelDate: z.string().datetime().optional().nullable(),
      featured: z.boolean().default(false),
      approved: z.boolean().default(false),
      imageUrl: z.string().url().optional().nullable(),
    });

    const validatedData = testimonialSchema.parse(body);

    // Validate customer exists if customerId provided
    if (validatedData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: validatedData.customerId },
      });
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
    }

    // Validate package exists if packageId provided
    if (validatedData.packageId) {
      const vacationPackage = await prisma.vacationPackage.findUnique({
        where: { id: validatedData.packageId },
      });
      if (!vacationPackage) {
        return NextResponse.json(
          { error: "Package not found" },
          { status: 404 }
        );
      }
    }

    // Create testimonial
    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: validatedData.customerName,
        customerId: validatedData.customerId || undefined,
        customerLocation: validatedData.customerLocation || undefined,
        packageId: validatedData.packageId || undefined,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
        travelDate: validatedData.travelDate
          ? new Date(validatedData.travelDate)
          : undefined,
        featured: validatedData.featured,
        approved: validatedData.approved, // Defaults to false (requires admin review)
        imageUrl: validatedData.imageUrl || undefined,
        active: true,
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        package: {
          select: {
            id: true,
            title: true,
            destination: true,
          },
        },
      },
    });

    // Format dates for JSON response
    const formattedTestimonial = {
      ...testimonial,
      createdAt: testimonial.createdAt.toISOString(),
      updatedAt: testimonial.updatedAt.toISOString(),
      travelDate: testimonial.travelDate?.toISOString() || null,
    };

    return NextResponse.json(
      {
        success: true,
        testimonial: formattedTestimonial,
        message: "Testimonial created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}

// Export with authentication middleware
export const GET = withMiddleware(handleGET, requireAuth());
export const POST = withMiddleware(
  handlePOST,
  requireRole(UserRole.ADMIN, UserRole.AGENT)
);
