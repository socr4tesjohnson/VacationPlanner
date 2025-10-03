import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  withMiddleware,
  requireAuth,
  requireRole,
  requireAdmin,
} from "@/lib/middleware";
import {
  calculateBalanceDue,
  validateBookingDates,
  formatBookingResponse,
} from "@/lib/booking-helpers";
import { z } from "zod";
import { UserRole, BookingStatus, Prisma } from "@prisma/client";

/**
 * GET /api/admin/bookings/[id]
 * Get a single booking by ID with full details
 * Requires: Authentication
 */
async function handleGET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    // Fetch booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        package: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        travelers: {
          orderBy: {
            isChild: "asc", // Adults first, then children
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: formatBookingResponse(booking),
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/bookings/[id]
 * Update an existing booking
 * Requires: ADMIN or AGENT role
 */
async function handlePATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const body = await request.json();

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Validate request body with Zod
    const updateSchema = z.object({
      status: z.nativeEnum(BookingStatus).optional(),
      departureDate: z.string().datetime().optional(),
      returnDate: z.string().datetime().optional(),
      totalPrice: z.number().positive().optional(),
      depositPaid: z.number().min(0).optional(),
      adults: z.number().int().positive().optional(),
      children: z.number().int().min(0).optional(),
      specialRequests: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      travelers: z
        .array(
          z.object({
            id: z.string().uuid().optional(), // If provided, update existing traveler
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            dateOfBirth: z.string().datetime().nullable().optional(),
            age: z.number().int().min(0).nullable().optional(),
            isChild: z.boolean().default(false),
            specialNeeds: z.string().nullable().optional(),
          })
        )
        .optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Validate dates if both are provided or if one is being updated
    if (validatedData.departureDate || validatedData.returnDate) {
      const departureDate = validatedData.departureDate
        ? new Date(validatedData.departureDate)
        : existingBooking.departureDate;
      const returnDate = validatedData.returnDate
        ? new Date(validatedData.returnDate)
        : existingBooking.returnDate;

      const dateValidation = validateBookingDates(departureDate, returnDate);
      if (!dateValidation.isValid) {
        return NextResponse.json(
          { error: dateValidation.error },
          { status: 400 }
        );
      }
    }

    // Calculate new balance due if pricing changes
    let balanceDue: Prisma.Decimal | undefined;
    if (validatedData.totalPrice !== undefined || validatedData.depositPaid !== undefined) {
      const totalPrice =
        validatedData.totalPrice !== undefined
          ? validatedData.totalPrice
          : Number(existingBooking.totalPrice);
      const depositPaid =
        validatedData.depositPaid !== undefined
          ? validatedData.depositPaid
          : Number(existingBooking.depositPaid);
      balanceDue = calculateBalanceDue(totalPrice, depositPaid);
    }

    // Update booking and travelers in a transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update the booking
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          ...(validatedData.status && { status: validatedData.status }),
          ...(validatedData.departureDate && {
            departureDate: new Date(validatedData.departureDate),
          }),
          ...(validatedData.returnDate && {
            returnDate: new Date(validatedData.returnDate),
          }),
          ...(validatedData.totalPrice !== undefined && {
            totalPrice: new Prisma.Decimal(validatedData.totalPrice),
          }),
          ...(validatedData.depositPaid !== undefined && {
            depositPaid: new Prisma.Decimal(validatedData.depositPaid),
          }),
          ...(balanceDue !== undefined && { balanceDue }),
          ...(validatedData.adults !== undefined && {
            adults: validatedData.adults,
          }),
          ...(validatedData.children !== undefined && {
            children: validatedData.children,
          }),
          ...(validatedData.specialRequests !== undefined && {
            specialRequests: validatedData.specialRequests,
          }),
          ...(validatedData.notes !== undefined && {
            notes: validatedData.notes,
          }),
        },
      });

      // Update travelers if provided
      if (validatedData.travelers) {
        // Delete all existing travelers
        await tx.bookingTraveler.deleteMany({
          where: { bookingId },
        });

        // Create new travelers
        await tx.bookingTraveler.createMany({
          data: validatedData.travelers.map((traveler) => ({
            bookingId,
            firstName: traveler.firstName,
            lastName: traveler.lastName,
            dateOfBirth: traveler.dateOfBirth
              ? new Date(traveler.dateOfBirth)
              : null,
            age: traveler.age,
            isChild: traveler.isChild,
            specialNeeds: traveler.specialNeeds,
          })),
        });
      }

      // Fetch the complete booking with relations
      return tx.booking.findUnique({
        where: { id: bookingId },
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

    return NextResponse.json({
      success: true,
      booking: formatBookingResponse(updatedBooking),
      message: "Booking updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/bookings/[id]
 * Cancel or delete a booking
 * By default, performs soft delete (sets status to CANCELLED)
 * Use ?hard=true query parameter to perform hard delete
 * Requires: ADMIN role only
 */
async function handleDELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (hardDelete) {
      // Hard delete: completely remove the booking
      // Travelers will be cascade deleted due to schema configuration
      await prisma.booking.delete({
        where: { id: bookingId },
      });

      return NextResponse.json({
        success: true,
        message: "Booking permanently deleted",
      });
    } else {
      // Soft delete: set status to CANCELLED
      const cancelledBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
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
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        booking: formatBookingResponse(cancelledBooking),
        message: "Booking cancelled successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting/cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to delete/cancel booking" },
      { status: 500 }
    );
  }
}

// Export with authentication middleware
export const GET = withMiddleware(handleGET, requireAuth());
export const PATCH = withMiddleware(
  handlePATCH,
  requireRole(UserRole.ADMIN, UserRole.AGENT)
);
export const DELETE = withMiddleware(handleDELETE, requireAdmin());
