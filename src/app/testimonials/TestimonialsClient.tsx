"use client";

import { useState, useEffect } from "react";
import { Filter, Star, Loader2, MessageSquare } from "lucide-react";
import TestimonialCard from "@/components/testimonials/TestimonialCard";

interface Testimonial {
  id: string;
  customerName: string;
  customerLocation: string | null;
  rating: number;
  title: string;
  content: string;
  travelDate: string | null;
  featured: boolean;
  imageUrl: string | null;
  package: {
    id: string;
    title: string;
    destination: string;
  } | null;
}

interface TestimonialsResponse {
  success: boolean;
  testimonials: Testimonial[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TestimonialsClient() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Fetch testimonials
  useEffect(() => {
    fetchTestimonials();
  }, [selectedRating, currentPage]);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (selectedRating !== "all") {
        params.append("rating", selectedRating);
      }

      const response = await fetch(`/api/testimonials?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch testimonials");
      }

      const data: TestimonialsResponse = await response.json();

      if (data.success) {
        setTestimonials(data.testimonials);
        setPagination(data.pagination);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingFilter = (rating: string) => {
    setSelectedRating(rating);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Rating filter options
  const ratingFilters = [
    { value: "all", label: "All Ratings", icon: "⭐" },
    { value: "5", label: "5 Stars", icon: "⭐⭐⭐⭐⭐" },
    { value: "4", label: "4 Stars", icon: "⭐⭐⭐⭐" },
    { value: "3", label: "3 Stars", icon: "⭐⭐⭐" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white py-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-7xl">💬</div>
          <div className="absolute top-20 right-20 text-5xl">⭐</div>
          <div className="absolute bottom-10 left-1/4 text-6xl">❤️</div>
          <div className="absolute bottom-20 right-10 text-5xl">✨</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <span className="text-white font-semibold">
              Hear From Our Happy Travelers
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            What Our Travelers Say
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">
            Real stories from real families who trusted us with their dream
            vacations
          </p>
          <div className="flex justify-center items-center gap-8 text-lg">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <div className="text-3xl font-bold">{pagination.total}+</div>
              <div className="text-sm">Happy Customers</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <div className="text-3xl font-bold">4.9</div>
              <div className="text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Filter by:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {ratingFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleRatingFilter(filter.value)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selectedRating === filter.value
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Loading testimonials...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchTestimonials}
                className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && testimonials.length === 0 && (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-12 text-center">
              <MessageSquare className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No testimonials found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t find any testimonials matching your filters.
              </p>
              <button
                onClick={() => handleRatingFilter("all")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-cyan-600 hover:to-blue-700 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Testimonials Grid */}
          {!loading && !error && testimonials.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {testimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    customerName={testimonial.customerName}
                    customerLocation={testimonial.customerLocation}
                    rating={testimonial.rating}
                    title={testimonial.title}
                    content={testimonial.content}
                    travelDate={testimonial.travelDate}
                    packageName={testimonial.package?.title || null}
                    packageDestination={testimonial.package?.destination || null}
                    imageUrl={testimonial.imageUrl}
                    featured={testimonial.featured}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-cyan-600 border-2 border-cyan-600 hover:bg-cyan-600 hover:text-white"
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                              currentPage === page
                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="w-10 h-10 flex items-center justify-center text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className={`px-4 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                      currentPage === pagination.totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-cyan-600 border-2 border-cyan-600 hover:bg-cyan-600 hover:text-white"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Results summary */}
              <div className="text-center mt-8 text-gray-600">
                Showing {testimonials.length} of {pagination.total}{" "}
                testimonials
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Create Your Own Amazing Story?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of happy families who have experienced unforgettable
            vacations with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/vacations"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-blue-700 transform hover:scale-105 transition-all shadow-lg inline-block focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Browse Vacation Packages
            </a>
            <a
              href="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all shadow-lg inline-block focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Start Planning with Laura
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
