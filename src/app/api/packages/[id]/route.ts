import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageData = await prisma.vacationPackage.findUnique({
      where: { id: params.id },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    if (!packageData) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: packageData.id,
      title: packageData.title,
      slug: packageData.slug,
      destination: packageData.destination,
      shortDescription: packageData.shortDescription,
      startingPrice: packageData.startingPrice,
      nights: packageData.nights,
      days: packageData.days,
      type: packageData.type,
      images: packageData.images.map((img) => ({
        url: img.url,
        alt: img.altText,
      })),
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 500 }
    );
  }
}
