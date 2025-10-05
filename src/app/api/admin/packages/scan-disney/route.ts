import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { withMiddleware, requireAdmin } from "@/lib/middleware";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function handlePOST(request: NextRequest) {
  try {
    // Fetch Disney special offers page
    const disneyUrl = "https://disneyworld.disney.go.com/special-offers/";

    // Use fetch to get the page content
    const response = await fetch(disneyUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Disney website");
    }

    const html = await response.text();

    // Use Claude AI to extract offers from the HTML
    const aiPrompt = `You are analyzing the Disney World special offers page. Extract all current vacation offers/deals from this HTML content.

For each offer, extract:
1. Offer title/name
2. Brief description
3. Destination (should be "Walt Disney World, Orlando" unless specified otherwise)
4. Any price information (if available)
5. Duration/dates (if available)
6. Key features/highlights

HTML Content (truncated to first 15000 characters):
${html.substring(0, 15000)}

Return a JSON array of offers in this format:
[
  {
    "title": "...",
    "description": "...",
    "destination": "Walt Disney World, Orlando",
    "priceInfo": "...",
    "duration": "...",
    "highlights": ["...", "..."]
  }
]

If you can't find clear offers in the HTML, return an empty array [].`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 3000,
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

    let offers = [];
    try {
      offers = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", jsonText.substring(0, 200));
      // Return empty array if parsing fails
      offers = [];
    }

    // Get existing packages to check for duplicates
    const existingPackages = await prisma.vacationPackage.findMany({
      select: { title: true, slug: true },
    });

    const existingTitles = new Set(
      existingPackages.map((p) => p.title.toLowerCase())
    );

    // Filter out offers that already exist
    const newOffers = offers.filter(
      (offer: any) => !existingTitles.has(offer.title.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      totalFound: offers.length,
      newOffers: newOffers.length,
      existingOffers: offers.length - newOffers.length,
      offers: newOffers,
    });
  } catch (error) {
    console.error("Disney scan error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to scan Disney website",
      },
      { status: 500 }
    );
  }
}

// Export with admin middleware
export const POST = withMiddleware(handlePOST, requireAdmin());
