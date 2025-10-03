import Link from "next/link";
import Image from "next/image";

interface PackageCardProps {
  id: string;
  title: string;
  slug: string;
  destination: string;
  shortDescription: string;
  startingPrice: number;
  nights: number;
  days: number;
  imageUrl: string;
  imageAlt: string;
  type: string;
  featured?: boolean;
}

export default function PackageCard({
  title,
  slug,
  destination,
  shortDescription,
  startingPrice,
  nights,
  days,
  imageUrl,
  imageAlt,
  type,
  featured,
}: PackageCardProps) {
  const typeLabel = {
    "disney-park": "Disney Park",
    "disney-cruise": "Disney Cruise",
    cruise: "Cruise",
    combo: "Combo Package",
  }[type] || type;

  return (
    <Link href={`/packages/${slug}`} className="group block focus:outline-none focus:ring-4 focus:ring-blue-500/50 rounded-xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-56 w-full overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {featured && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg">
              Featured
            </div>
          )}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-lg text-xs font-semibold shadow-md">
            {typeLabel}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {destination}
          </div>
          <p className="text-gray-600 mb-5 line-clamp-2 text-sm leading-relaxed flex-1">{shortDescription}</p>

          <div className="flex justify-between items-end pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Starting from</p>
              <p className="text-3xl font-bold text-blue-600">
                ${startingPrice.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">per person</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {days}D / {nights}N
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
