import { prisma } from "@/lib/db";
import PackageCard from "@/components/packages/PackageCard";

async function getPackages(searchParams: { type?: string }) {
  const where: any = { active: true };

  if (searchParams.type) {
    where.type = searchParams.type;
  }

  const packages = await prisma.vacationPackage.findMany({
    where,
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: [{ featured: "desc" }, { priority: "asc" }],
  });

  return packages;
}

export default async function VacationsPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const packages = await getPackages(searchParams);

  const pageTitle = searchParams.type
    ? {
        "disney-park": "Disney Park Vacations",
        "disney-cruise": "Disney Cruise Vacations",
        cruise: "Cruise Vacations",
      }[searchParams.type] || "All Vacations"
    : "All Vacations";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-gray-600">
            Explore our collection of carefully curated vacation packages
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-4">
          <a
            href="/vacations"
            className={`px-6 py-2 rounded-lg font-medium transition ${
              !searchParams.type
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Vacations
          </a>
          <a
            href="/vacations?type=disney-park"
            className={`px-6 py-2 rounded-lg font-medium transition ${
              searchParams.type === "disney-park"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Disney Parks
          </a>
          <a
            href="/vacations?type=disney-cruise"
            className={`px-6 py-2 rounded-lg font-medium transition ${
              searchParams.type === "disney-cruise"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Disney Cruises
          </a>
          <a
            href="/vacations?type=cruise"
            className={`px-6 py-2 rounded-lg font-medium transition ${
              searchParams.type === "cruise"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cruises
          </a>
        </div>

        {/* Package Grid */}
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                title={pkg.title}
                slug={pkg.slug}
                destination={pkg.destination}
                shortDescription={pkg.shortDescription}
                startingPrice={pkg.startingPrice}
                nights={pkg.nights}
                days={pkg.days}
                imageUrl={pkg.images[0]?.url || "/placeholder.jpg"}
                imageAlt={pkg.images[0]?.altText || pkg.title}
                type={pkg.type}
                featured={pkg.featured}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No packages found. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
