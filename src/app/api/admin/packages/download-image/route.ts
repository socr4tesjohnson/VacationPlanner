import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { withMiddleware, requireAdmin } from "@/lib/middleware";

async function handlePOST(request: NextRequest) {
  try {
    const { imageUrl, filename } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image from URL");
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename
    const timestamp = Date.now();
    const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
    const finalFilename = filename || `disney-${timestamp}${ext}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "packages");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Save image
    const filepath = path.join(uploadDir, finalFilename);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename: finalFilename,
      url: `/uploads/packages/${finalFilename}`,
    });
  } catch (error) {
    console.error("Image download error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to download image",
      },
      { status: 500 }
    );
  }
}

// Export with admin middleware
export const POST = withMiddleware(handlePOST, requireAdmin());
