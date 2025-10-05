import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { withMiddleware, requireAdmin } from "@/lib/middleware";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function handlePOST(request: NextRequest) {
  try {
    const { prompt, type, destination, nights, days, startingPrice, category } =
      await request.json();

    // Create AI prompt
    const aiPrompt = `You are a professional travel content writer. Create compelling vacation package content based on the following information:

Vacation Description: ${prompt}
Package Type: ${type}
Destination: ${destination}
Duration: ${nights} nights / ${days} days
Starting Price: $${startingPrice}
Category: ${category}

Generate the following in JSON format:
1. A catchy, professional title (max 60 characters)
2. A short description (1-2 sentences, max 150 characters)
3. A full compelling description (3-4 paragraphs highlighting features, experiences, and why customers should book)
4. A list of 6-8 key inclusions (what's included in the package)
5. A list of 3-4 exclusions (what's NOT included)
6. A list of 5-7 relevant tags/keywords

Return ONLY valid JSON in this exact format:
{
  "title": "...",
  "shortDescription": "...",
  "description": "...",
  "inclusions": ["...", "..."],
  "exclusions": ["...", "..."],
  "tags": ["...", "..."]
}`;

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

    // Extract JSON from response
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const content = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate content",
      },
      { status: 500 }
    );
  }
}

// Export with admin middleware
export const POST = withMiddleware(handlePOST, requireAdmin());
