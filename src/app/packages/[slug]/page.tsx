import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

async function getPackage(slug: string) {
  const pkg = await prisma.vacationPackage.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      itineraries: { orderBy: { dayNumber: "asc" } },
    },
  });

  return pkg;
}

export default async function PackageDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const pkg = await getPackage(params.slug);

  if (!pkg) {
    notFound();
  }

  const inclusions = JSON.parse(pkg.inclusions);
  const exclusions = JSON.parse(pkg.exclusions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 w-full">
        {pkg.images[0] && (
          <Image
            src={pkg.images[0].url}
            alt={pkg.images[0].altText}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <h1 className="text-5xl font-bold text-white mb-4">{pkg.title}</h1>
            <p className="text-xl text-white">{pkg.destination}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{pkg.description}</p>
            </div>

            {/* Itinerary */}
            {pkg.itineraries.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">Itinerary</h2>
                <div className="space-y-6">
                  {pkg.itineraries.map((day) => {
                    const activities = JSON.parse(day.activities);
                    const meals = JSON.parse(day.meals);

                    return (
                      <div
                        key={day.id}
                        className="border-l-4 border-blue-600 pl-4"
                      >
                        <h3 className="text-xl font-semibold mb-2">
                          Day {day.dayNumber}: {day.title}
                        </h3>
                        <p className="text-gray-700 mb-3">{day.description}</p>
                        {activities.length > 0 && (
                          <div className="mb-2">
                            <p className="font-semibold text-sm text-gray-600 mb-1">
                              Activities:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              {activities.map(
                                (activity: string, idx: number) => (
                                  <li key={idx}>{activity}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                        {meals.length > 0 && (
                          <div>
                            <p className="font-semibold text-sm text-gray-600 mb-1">
                              Meals:
                            </p>
                            <p className="text-gray-700">{meals.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-green-600">
                    ✓ What&apos;s Included
                  </h3>
                  <ul className="space-y-2">
                    {inclusions.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-red-600">
                    ✗ Not Included
                  </h3>
                  <ul className="space-y-2">
                    {exclusions.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">Starting from</p>
                <p className="text-4xl font-bold text-blue-600">
                  ${pkg.startingPrice.toFixed(0)}
                </p>
                <p className="text-sm text-gray-500">per person</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">
                    {pkg.days} Days / {pkg.nights} Nights
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Destination</span>
                  <span className="font-semibold">{pkg.destination}</span>
                </div>
                {pkg.deposit && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Deposit</span>
                    <span className="font-semibold">
                      ${pkg.deposit.toFixed(0)}
                    </span>
                  </div>
                )}
              </div>

              <Link
                href="/contact"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
              >
                Plan This Trip with Laura
              </Link>

              <Link
                href="/vacations"
                className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Back to All Packages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
