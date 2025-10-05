"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

interface TestimonialCardProps {
  customerName: string;
  customerLocation?: string | null;
  rating: number;
  title: string;
  content: string;
  travelDate?: string | null;
  packageName?: string | null;
  packageDestination?: string | null;
  imageUrl?: string | null;
  featured?: boolean;
}

export default function TestimonialCard({
  customerName,
  customerLocation,
  rating,
  title,
  content,
  travelDate,
  packageName,
  packageDestination,
  imageUrl,
  featured,
}: TestimonialCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Truncate content if too long
  const shouldTruncate = content.length > 250;
  const displayContent =
    shouldTruncate && !isExpanded ? content.substring(0, 250) + "..." : content;

  // Format travel date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const formattedTravelDate = formatDate(travelDate);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all duration-300 p-6 h-full flex flex-col ${
        featured
          ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white"
          : "border-gray-200 hover:border-blue-200 hover:shadow-lg"
      }`}
    >
      {/* Featured badge */}
      {featured && (
        <div className="inline-block bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-semibold mb-4 self-start">
          Featured Review
        </div>
      )}

      {/* Header with avatar and rating */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={`${customerName}'s profile photo`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-200">
              {getInitials(customerName)}
            </div>
          )}
        </div>

        {/* Name and Rating */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 mb-1 truncate">
            {customerName}
          </h3>
          {customerLocation && (
            <div className="flex items-center text-xs text-gray-600 mb-2">
              <MapPin className="w-3 h-3 mr-1 text-gray-500" />
              {customerLocation}
            </div>
          )}
          <StarRating rating={rating} size="sm" />
        </div>
      </div>

      {/* Testimonial Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
        {title}
      </h3>

      {/* Testimonial Content */}
      <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap text-sm flex-1">
        {displayContent}
      </p>

      {/* Read More button */}
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}

      {/* Footer with package and date info */}
      {(packageName || formattedTravelDate) && (
        <div className="border-t border-gray-100 pt-4 mt-auto space-y-2">
          {packageName && (
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {packageName}
                </p>
                {packageDestination && (
                  <p className="text-xs text-gray-600">{packageDestination}</p>
                )}
              </div>
            </div>
          )}
          {formattedTravelDate && (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
              <span>Traveled {formattedTravelDate}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
