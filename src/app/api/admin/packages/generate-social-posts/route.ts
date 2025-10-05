import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { withMiddleware, requireAdmin } from "@/lib/middleware";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function handlePOST(request: NextRequest) {
  try {
    const {
      title,
      description,
      fullDescription,
      destination,
      price,
      nights,
      days,
      type,
      category,
      inclusions,
      tags,
      adjustmentPrompt,
    } = await request.json();

    // Build a rich prompt with all available information
    let packageDetails = `You are a professional social media marketing expert specializing in travel and vacation packages.

Create 3 different engaging social media posts for this vacation package:

**Package Title:** ${title}
**Destination:** ${destination}
**Duration:** ${nights} nights / ${days} days
**Type:** ${type}
**Category:** ${category}
**Starting Price:** $${price}

**Short Description:**
${description}

**Full Description:**
${fullDescription || description}`;

    if (inclusions && inclusions.length > 0) {
      packageDetails += `\n\n**What's Included:**\n${inclusions.map((item: string) => `- ${item}`).join("\n")}`;
    }

    if (tags && tags.length > 0) {
      packageDetails += `\n\n**Key Themes/Tags:** ${tags.join(", ")}`;
    }

    const aiPrompt = `${packageDetails}

${adjustmentPrompt ? `\n**IMPORTANT ADJUSTMENT REQUEST:** ${adjustmentPrompt}\n\n` : ""}

Create posts optimized for:
1. Instagram (visual, lifestyle-focused, emoji-rich)
2. Facebook (conversational, detailed, family-friendly)
3. Twitter/X (concise, exciting, action-oriented)

Each post should:
- Be engaging and compelling
- Include relevant emojis
- Have a clear call-to-action
- Include 5-8 relevant hashtags
- Match the platform's style and audience

Return ONLY valid JSON in this exact format:
[
  {
    "platform": "instagram",
    "text": "The main post text with emojis",
    "hashtags": ["#VacationGoals", "#TravelMore", "#DisneyMagic", "#FamilyVacation", "#DreamDestination"]
  },
  {
    "platform": "facebook",
    "text": "The main post text with emojis",
    "hashtags": ["#VacationPlanning", "#FamilyTravel", "#DisneyWorld", "#MakingMemories"]
  },
  {
    "platform": "twitter",
    "text": "The main post text with emojis (under 280 characters)",
    "hashtags": ["#Travel", "#Disney", "#Vacation", "#DreamBig"]
  }
]`;

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

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON with robust error handling
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonText.includes("```")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    // Try to find JSON array in the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    let posts = [];
    try {
      posts = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", jsonText.substring(0, 200));
      // Return default posts if parsing fails
      posts = [
        {
          platform: "instagram",
          text: `✨ ${title} ✨\n\n${description}\n\nStarting at just $${price}! 🎉\n\nBook your dream vacation today! Link in bio 👆`,
          hashtags: [
            "#VacationGoals",
            "#TravelMore",
            "#Disney",
            "#FamilyVacation",
            "#DreamDestination",
          ],
        },
        {
          platform: "facebook",
          text: `🌟 ${title}\n\n${description}\n\nPrices start at $${price} per person. Don't miss out on this amazing opportunity to create unforgettable memories!\n\nContact us today to book your adventure! 📞`,
          hashtags: [
            "#VacationPlanning",
            "#FamilyTravel",
            "#Disney",
            "#MakingMemories",
          ],
        },
        {
          platform: "twitter",
          text: `✨ ${title}\n\nFrom $${price}! Book now! 🎉`,
          hashtags: ["#Travel", "#Disney", "#Vacation", "#DreamBig"],
        },
      ];
    }

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Error generating social media posts:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate social media posts",
      },
      { status: 500 }
    );
  }
}

// Export with admin middleware
export const POST = withMiddleware(handlePOST, requireAdmin());
