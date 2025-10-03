"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Recommendation {
  packageId: string;
  packageTitle: string;
  matchScore: number;
  reasoning: string;
  highlights: string[];
}

interface PackageDetails {
  id: string;
  title: string;
  slug: string;
  destination: string;
  shortDescription: string;
  startingPrice: number;
  nights: number;
  days: number;
  type: string;
  images: { url: string; alt: string }[];
}

export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [packages, setPackages] = useState<{ [key: string]: PackageDetails }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const recommendationsData = searchParams.get("data");

    if (!recommendationsData) {
      setError("No recommendations found");
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(recommendationsData));
      setRecommendations(parsed);

      // Fetch package details for each recommendation
      const fetchPackages = async () => {
        try {
          const packagePromises = parsed.map((rec: Recommendation) =>
            fetch(`/api/packages/${rec.packageId}`).then(res => res.json())
          );
          const packageData = await Promise.all(packagePromises);

          const packagesMap: { [key: string]: PackageDetails } = {};
          packageData.forEach((pkg) => {
            packagesMap[pkg.id] = pkg;
          });

          setPackages(packagesMap);
        } catch (err) {
          console.error("Error fetching package details:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchPackages();
    } catch (err) {
      setError("Failed to load recommendations");
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading your personalized recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Recommendations Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/contact"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
            >
              Submit New Inquiry
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🤖 AI-Powered Results
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Perfect Vacation Matches
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your preferences, our AI has selected these {recommendations.length} vacation packages that best match your needs
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-8">
          {recommendations.map((rec, index) => {
            const pkg = packages[rec.packageId];
            const primaryImage = pkg?.images?.[0];

            return (
              <div
                key={rec.packageId}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  {primaryImage && (
                    <div className="md:w-1/3 relative h-64 md:h-auto">
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt}
                        fill
                        className="object-cover"
                      />
                      {/* Match Badge */}
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                        #{index + 1} • {rec.matchScore}% Match
                      </div>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="md:w-2/3 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {rec.packageTitle}
                        </h2>
                        {pkg && (
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>📍 {pkg.destination}</span>
                            <span>🗓️ {pkg.nights} nights / {pkg.days} days</span>
                            <span className="font-semibold text-blue-600">
                              From ${pkg.startingPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-blue-600">🤖</span> Why This Package?
                      </h3>
                      <p className="text-gray-700">{rec.reasoning}</p>
                    </div>

                    {/* Highlights */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Perfect For You:</h3>
                      <ul className="space-y-2">
                        {rec.highlights.map((highlight, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-1">✓</span>
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      {pkg && (
                        <Link
                          href={`/vacations/${pkg.slug}`}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          View Details
                        </Link>
                      )}
                      <Link
                        href="/contact"
                        className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                      >
                        Book This Package
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Not quite what you're looking for?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vacations"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Browse All Packages
            </Link>
            <Link
              href="/contact"
              className="border-2 border-gray-600 text-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Submit New Inquiry
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
