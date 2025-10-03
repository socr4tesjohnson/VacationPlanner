import { prisma } from "./db";
import { Prisma } from "@prisma/client";

/**
 * Generates a unique confirmation number in format: VPL-YYYY-XXXXXX
 * Example: VPL-2025-A1B2C3
 *
 * @returns Promise<string> - Unique confirmation number
 */
export async function generateConfirmationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  let confirmationNumber: string;
  let attempts = 0;
  const maxAttempts = 10;

  // Keep generating until we find a unique one
  while (attempts < maxAttempts) {
    const randomPart = crypto.randomUUID().substring(0, 6).toUpperCase();
    confirmationNumber = `VPL-${year}-${randomPart}`;

    // Check if this confirmation number already exists
    const existing = await prisma.booking.findUnique({
      where: { confirmationNumber },
    });

    if (!existing) {
      return confirmationNumber;
    }

    attempts++;
  }

  // Fallback: use UUID if we couldn't generate unique number after 10 attempts
  const fallback = `VPL-${year}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
  return fallback;
}

/**
 * Calculates the balance due on a booking
 *
 * @param totalPrice - Total price of the booking
 * @param depositPaid - Amount of deposit already paid
 * @returns Decimal - Balance remaining
 */
export function calculateBalanceDue(
  totalPrice: Prisma.Decimal | number,
  depositPaid: Prisma.Decimal | number
): Prisma.Decimal {
  const total = new Prisma.Decimal(totalPrice);
  const deposit = new Prisma.Decimal(depositPaid);
  return total.minus(deposit);
}

/**
 * Validates that booking dates are logical
 * - Return date must be after departure date
 * - Dates should be in the future (optional check)
 *
 * @param departureDate - When the trip starts
 * @param returnDate - When the trip ends
 * @param requireFutureDates - Whether to require dates in the future (default: false)
 * @returns Object with isValid flag and optional error message
 */
export function validateBookingDates(
  departureDate: Date,
  returnDate: Date,
  requireFutureDates: boolean = false
): { isValid: boolean; error?: string } {
  // Check that return date is after departure date
  if (returnDate <= departureDate) {
    return {
      isValid: false,
      error: "Return date must be after departure date",
    };
  }

  // Optionally check that dates are in the future
  if (requireFutureDates) {
    const now = new Date();
    if (departureDate < now) {
      return {
        isValid: false,
        error: "Departure date must be in the future",
      };
    }
  }

  return { isValid: true };
}

/**
 * Formats a booking object for API response
 * Converts Decimal types to numbers and formats dates
 *
 * @param booking - The booking object from Prisma
 * @returns Formatted booking object
 */
export function formatBookingResponse(booking: any) {
  return {
    ...booking,
    totalPrice: booking.totalPrice ? Number(booking.totalPrice) : 0,
    depositPaid: booking.depositPaid ? Number(booking.depositPaid) : 0,
    balanceDue: booking.balanceDue ? Number(booking.balanceDue) : 0,
  };
}

/**
 * Validates that a customer exists in the database
 *
 * @param customerId - The customer ID to validate
 * @returns Promise<boolean> - True if customer exists, false otherwise
 */
export async function validateCustomerExists(
  customerId: string
): Promise<boolean> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  return customer !== null;
}

/**
 * Validates that a package exists in the database
 *
 * @param packageId - The package ID to validate
 * @returns Promise<boolean> - True if package exists, false otherwise
 */
export async function validatePackageExists(
  packageId: string
): Promise<boolean> {
  const vacationPackage = await prisma.vacationPackage.findUnique({
    where: { id: packageId },
  });
  return vacationPackage !== null;
}
