import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  withMiddleware,
  requireAuth,
  requireRole,
  getUserFromRequest,
} from "@/lib/middleware";
import {
  generateConfirmationNumber,
  calculateBalanceDue,
  validateBookingDates,
  formatBookingResponse,
  validateCustomerExists,
  validatePackageExists,
} from "@/lib/booking-helpers";
import { z } from "zod";
import { UserRole, BookingStatus, Prisma } from "@prisma/client";

/**
 * GET /api/admin/bookings
 * List all bookings with pagination, filtering, and sorting
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
    const status = searchParams.get("status") as BookingStatus | null;
    const customerId = searchParams.get("customer");
    const packageId = searchParams.get("package");

    // Sort parameters
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause for filtering
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (packageId) {
      where.packageId = packageId;
    }

    // Build orderBy clause for sorting
    let orderBy: any = {};
    if (sortBy === "confirmationNumber" || sortBy === "departureDate") {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Fetch bookings with related data
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
              nights: true,
              days: true,
            },
          },
          travelers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              age: true,
              isChild: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    // Format bookings for response
    const formattedBookings = bookings.map(formatBookingResponse);

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/bookings
 * Create a new booking
 * Requires: ADMIN or AGENT role
 */
async function handlePOST(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body with Zod
    const bookingSchema = z.object({
      customerId: z.string().uuid(),
      packageId: z.string().uuid(),
      departureDate: z.string().datetime(),
      returnDate: z.string().datetime(),
      totalPrice: z.number().positive(),
      depositPaid: z.number().min(0).default(0),
      adults: z.number().int().positive(),
      children: z.number().int().min(0).default(0),
      specialRequests: z.string().optional(),
      notes: z.string().optional(),
      travelers: z
        .array(
          z.object({
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            dateOfBirth: z.string().datetime().optional(),
            age: z.number().int().min(0).optional(),
            isChild: z.boolean().default(false),
            specialNeeds: z.string().optional(),
          })
        )
        .min(1),
    });

    const validatedData = bookingSchema.parse(body);

    // Validate customer exists
    const customerExists = await validateCustomerExists(
      validatedData.customerId
    );
    if (!customerExists) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Validate package exists
    const packageExists = await validatePackageExists(validatedData.packageId);
    if (!packageExists) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Validate dates
    const departureDate = new Date(validatedData.departureDate);
    const returnDate = new Date(validatedData.returnDate);
    const dateValidation = validateBookingDates(departureDate, returnDate);
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      );
    }

    // Generate unique confirmation number
    const confirmationNumber = await generateConfirmationNumber();

    // Calculate balance due
    const balanceDue = calculateBalanceDue(
      validatedData.totalPrice,
      validatedData.depositPaid
    );

    // Create booking and travelers in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.booking.create({
        data: {
          confirmationNumber,
          customerId: validatedData.customerId,
          packageId: validatedData.packageId,
          userId: user.id,
          status: BookingStatus.PENDING,
          departureDate,
          returnDate,
          totalPrice: new Prisma.Decimal(validatedData.totalPrice),
          depositPaid: new Prisma.Decimal(validatedData.depositPaid),
          balanceDue,
          adults: validatedData.adults,
          children: validatedData.children,
          specialRequests: validatedData.specialRequests,
          notes: validatedData.notes,
        },
      });

      // Create travelers
      await tx.bookingTraveler.createMany({
        data: validatedData.travelers.map((traveler) => ({
          bookingId: newBooking.id,
          firstName: traveler.firstName,
          lastName: traveler.lastName,
          dateOfBirth: traveler.dateOfBirth
            ? new Date(traveler.dateOfBirth)
            : undefined,
          age: traveler.age,
          isChild: traveler.isChild,
          specialNeeds: traveler.specialNeeds,
        })),
      });

      // Fetch the complete booking with relations
      return tx.booking.findUnique({
        where: { id: newBooking.id },
        include: {
          customer: true,
          package: true,
          travelers: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        booking: formatBookingResponse(booking),
        message: "Booking created successfully",
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

    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
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
