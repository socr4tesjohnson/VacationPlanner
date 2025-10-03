import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { withMiddleware, requireAdmin } from "@/lib/middleware";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function handlePOST(request: NextRequest) {
  try {
    // Fetch Adobe Stock search page for Disney World images
    const adobeStockUrl = "https://stock.adobe.com/search?k=walt+disney+world";

    const response = await fetch(adobeStockUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Adobe Stock page");
    }

    const html = await response.text();

    // Use Claude AI to extract image URLs from HTML
    const aiPrompt = `Extract all stock photo image URLs from this Adobe Stock search results page for "Walt Disney World". Look for high-quality preview images that would be suitable for vacation packages (parks, attractions, families having fun, castles, rides, etc.).

For each image, extract:
1. The preview image URL (full URL, including https://)
2. A descriptive caption based on the image or alt text
3. Skip small thumbnails, icons, or UI elements - only get the main preview images

Important: Look for images in <img> tags, especially those with src or data-src attributes containing URLs like "https://t4.ftcdn.net" or similar Adobe Stock image domains.

HTML Content (truncated to first 20000 characters):
${html.substring(0, 20000)}

Return ONLY a JSON array in this format:
[
  {
    "url": "https://...",
    "description": "..."
  }
]

If you can't find clear image URLs, return an empty array [].`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: aiPrompt,
        },
      ],
    });

    // Parse AI response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let jsonText = responseText.trim();

    // Remove markdown code blocks
    if (jsonText.includes("```")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    // Try to find JSON array in the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    let images = [];
    try {
      images = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", jsonText.substring(0, 200));
      images = [];
    }

    return NextResponse.json({
      success: true,
      images,
      totalFound: images.length,
    });
  } catch (error) {
    console.error("Disney image scan error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to scan Disney images",
      },
      { status: 500 }
    );
  }
}

// Export with admin middleware
export const POST = withMiddleware(handlePOST, requireAdmin());
