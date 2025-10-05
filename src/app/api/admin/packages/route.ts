import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { withMiddleware, requireAdmin } from "@/lib/middleware";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function handlePOST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract fields
    const title = formData.get("title") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const destination = formData.get("destination") as string;
    const nights = parseInt(formData.get("nights") as string);
    const days = parseInt(formData.get("days") as string);
    const startingPrice = parseFloat(formData.get("startingPrice") as string);
    const category = formData.get("category") as string;
    const inclusions = JSON.parse(formData.get("inclusions") as string);
    const exclusions = JSON.parse(formData.get("exclusions") as string);
    const tags = JSON.parse(formData.get("tags") as string);

    // Generate slug
    const slug = generateSlug(title);

    // Create package in database
    const vacationPackage = await prisma.vacationPackage.create({
      data: {
        title,
        slug,
        type,
        destination,
        description,
        shortDescription,
        startingPrice,
        currency: "USD",
        pricePerPerson: true,
        deposit: startingPrice * 0.2, // 20% deposit
        nights,
        days,
        minTravelers: 1,
        maxTravelers: 10,
        inclusions: JSON.stringify(inclusions),
        exclusions: JSON.stringify(exclusions),
        featured: false,
        active: true,
        tags: JSON.stringify(tags),
        category,
        priority: 100,
      },
    });

    // Handle image uploads
    const imageFiles: File[] = [];
    let index = 0;
    while (formData.has(`image${index}`)) {
      const file = formData.get(`image${index}`) as File;
      if (file) imageFiles.push(file);
      index++;
    }

    if (imageFiles.length > 0) {
      // Ensure upload directory exists
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "packages"
      );
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      // Save images
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${slug}-${timestamp}-${i}${path.extname(file.name)}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Create image record in database
        await prisma.image.create({
          data: {
            packageId: vacationPackage.id,
            url: `/uploads/packages/${filename}`,
            altText: `${title} - Image ${i + 1}`,
            caption: "",
            isPrimary: i === 0, // First image is primary
            order: i,
            width: 800,
            height: 600,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      package: vacationPackage,
    });
  } catch (error) {
    console.error("Package creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create package",
      },
      { status: 500 }
    );
  }
}

// Export the wrapped handler with admin middleware
export const POST = withMiddleware(handlePOST, requireAdmin());
