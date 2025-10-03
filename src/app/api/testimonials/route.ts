import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/testimonials
 * Public endpoint for approved testimonials
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filter parameters
    const featured = searchParams.get("featured");
    const packageId = searchParams.get("packageId");
    const rating = searchParams.get("rating");

    // Sort parameters
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause - ONLY approved AND active testimonials
    const where: any = {
      approved: true,
      active: true,
    };

    if (featured === "true") {
      where.featured = true;
    }

    if (packageId) {
      where.packageId = packageId;
    }

    if (rating) {
      const ratingNum = parseInt(rating, 10);
      if (ratingNum >= 1 && ratingNum <= 5) {
        where.rating = ratingNum;
      }
    }

    // Build orderBy clause
    let orderBy: any = {};
    if (sortBy === "rating" || sortBy === "travelDate") {
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
        select: {
          id: true,
          customerName: true,
          customerLocation: true,
          rating: true,
          title: true,
          content: true,
          travelDate: true,
          featured: true,
          imageUrl: true,
          createdAt: true,
          package: {
            select: {
              id: true,
              title: true,
              destination: true,
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
