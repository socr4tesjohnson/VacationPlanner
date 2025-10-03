import Link from "next/link";

interface Recommendation {
  packageId: string;
  packageTitle: string;
  matchScore: number;
  reasoning: string;
  highlights: string[];
}

interface RecommendationResultsProps {
  recommendations: Recommendation[];
}

export default function RecommendationResults({
  recommendations,
}: RecommendationResultsProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-blue-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          🎯 Your Personalized Recommendations
        </h2>
        <p className="text-gray-600">
          Based on your preferences, our AI travel expert has selected these
          perfect vacation packages for you!
        </p>
      </div>

      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <div
            key={rec.packageId}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {rec.packageTitle}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-blue-600">
                        {rec.matchScore}% Match
                      </span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${rec.matchScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              {rec.reasoning}
            </p>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Why this package is perfect for you:
              </h4>
              <ul className="space-y-2">
                {rec.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/packages/${rec.packageId}`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Full Details →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center p-6 bg-white rounded-lg border border-blue-200">
        <p className="text-gray-700 mb-4">
          <strong>What happens next?</strong>
        </p>
        <p className="text-gray-600 mb-4">
          A vacation specialist will review these recommendations and contact
          you within 24 hours to discuss your options and answer any questions.
        </p>
        <p className="text-sm text-gray-500">
          You&apos;ll receive a confirmation email shortly with your inquiry details.
        </p>
      </div>
    </div>
  );
}
