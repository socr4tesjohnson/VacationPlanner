import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./db";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

interface InquiryData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  startDate?: string;
  endDate?: string;
  flexible: boolean;
  adults: number;
  children: number;
  budgetRange?: string;
  message: string;
}

interface Recommendation {
  packageId: string;
  packageTitle: string;
  matchScore: number;
  reasoning: string;
  highlights: string[];
}

export async function generateRecommendations(
  inquiryData: InquiryData
): Promise<Recommendation[]> {
  try {
    // Fetch all active packages from database
    const packages = await prisma.vacationPackage.findMany({
      where: { active: true },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    // Prepare package data for AI
    const packagesContext = packages.map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
      slug: pkg.slug,
      type: pkg.type,
      destination: pkg.destination,
      description: pkg.description,
      shortDescription: pkg.shortDescription,
      startingPrice: pkg.startingPrice,
      nights: pkg.nights,
      days: pkg.days,
      inclusions: JSON.parse(pkg.inclusions),
      category: pkg.category,
      tags: JSON.parse(pkg.tags),
    }));

    const prompt = `You are an expert vacation planning AI assistant. A client has submitted the following vacation inquiry:

Client Information:
- Name: ${inquiryData.firstName} ${inquiryData.lastName}
- Party: ${inquiryData.adults} adult(s), ${inquiryData.children} child(ren)
- Preferred Dates: ${inquiryData.startDate || "Not specified"} to ${inquiryData.endDate || "Not specified"}
- Date Flexibility: ${inquiryData.flexible ? "Yes" : "No"}
- Budget Range: ${inquiryData.budgetRange || "Not specified"}
- Client's Message: "${inquiryData.message}"

Available Vacation Packages:
${JSON.stringify(packagesContext, null, 2)}

Your task:
1. Analyze the client's preferences, budget, party size, and message
2. Select the TOP 3 vacation packages that best match their needs
3. For each recommendation, provide:
   - The package ID
   - A match score (0-100)
   - Reasoning for why this package fits their needs (2-3 sentences)
   - 3-4 specific highlights that align with their preferences

Return ONLY a valid JSON array with exactly 3 recommendations in this format:
[
  {
    "packageId": "package-id-here",
    "matchScore": 95,
    "reasoning": "This package is perfect because...",
    "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
  }
]

Order recommendations from best match to third best match.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse AI response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const recommendations = JSON.parse(jsonText);

    // Enrich recommendations with package titles
    const enrichedRecommendations = recommendations.map((rec: any) => {
      const pkg = packages.find((p) => p.id === rec.packageId);
      return {
        ...rec,
        packageTitle: pkg?.title || "Unknown Package",
      };
    });

    return enrichedRecommendations;
  } catch (error) {
    console.error("AI recommendation error:", error);
    throw new Error("Failed to generate recommendations");
  }
}
