import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withMiddleware, requireAuth, requireAdmin } from "@/lib/middleware";
import { z } from "zod";

/**
 * GET /api/admin/testimonials/[id]
 * Get a single testimonial by ID
 * Requires: Authentication (any authenticated user)
 */
async function handleGET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: params.id },
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
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Format dates for JSON response
    const formattedTestimonial = {
      ...testimonial,
      createdAt: testimonial.createdAt.toISOString(),
      updatedAt: testimonial.updatedAt.toISOString(),
      travelDate: testimonial.travelDate?.toISOString() || null,
    };

    return NextResponse.json({
      success: true,
      testimonial: formattedTestimonial,
    });
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonial" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/testimonials/[id]
 * Update a testimonial
 * Requires: ADMIN role (only admins can approve testimonials)
 */
async function handlePATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const updateSchema = z.object({
      customerName: z.string().min(1).optional(),
      customerId: z.string().uuid().optional().nullable(),
      customerLocation: z.string().optional().nullable(),
      packageId: z.string().uuid().optional().nullable(),
      rating: z.number().int().min(1).max(5).optional(),
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      travelDate: z.string().datetime().optional().nullable(),
      featured: z.boolean().optional(),
      approved: z.boolean().optional(),
      active: z.boolean().optional(),
      imageUrl: z.string().url().optional().nullable(),
    });

    const validatedData = updateSchema.parse(body);

    // Check if testimonial exists
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

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

    // Build update data object
    const updateData: any = {};

    if (validatedData.customerName !== undefined) {
      updateData.customerName = validatedData.customerName;
    }
    if (validatedData.customerId !== undefined) {
      updateData.customerId = validatedData.customerId || null;
    }
    if (validatedData.customerLocation !== undefined) {
      updateData.customerLocation = validatedData.customerLocation || null;
    }
    if (validatedData.packageId !== undefined) {
      updateData.packageId = validatedData.packageId || null;
    }
    if (validatedData.rating !== undefined) {
      updateData.rating = validatedData.rating;
    }
    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content;
    }
    if (validatedData.travelDate !== undefined) {
      updateData.travelDate = validatedData.travelDate
        ? new Date(validatedData.travelDate)
        : null;
    }
    if (validatedData.featured !== undefined) {
      updateData.featured = validatedData.featured;
    }
    if (validatedData.approved !== undefined) {
      updateData.approved = validatedData.approved;
    }
    if (validatedData.active !== undefined) {
      updateData.active = validatedData.active;
    }
    if (validatedData.imageUrl !== undefined) {
      updateData.imageUrl = validatedData.imageUrl || null;
    }

    // Update testimonial
    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      testimonial: formattedTestimonial,
      message: "Testimonial updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/testimonials/[id]
 * Delete a testimonial (soft delete by default, hard delete with ?hard=true)
 * Requires: ADMIN role
 */
async function handleDELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    // Check if testimonial exists
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    if (hardDelete) {
      // Hard delete - permanently remove from database
      await prisma.testimonial.delete({
        where: { id: params.id },
      });

      return NextResponse.json({
        success: true,
        message: "Testimonial permanently deleted",
      });
    } else {
      // Soft delete - set active to false
      await prisma.testimonial.update({
        where: { id: params.id },
        data: { active: false },
      });

      return NextResponse.json({
        success: true,
        message: "Testimonial deactivated",
      });
    }
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}

// Export handlers with authentication middleware
export const GET = withMiddleware(handleGET, requireAuth());
export const PATCH = withMiddleware(handlePATCH, requireAdmin());
export const DELETE = withMiddleware(handleDELETE, requireAdmin());
