"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2, Edit, Check, X, Plus } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

interface Testimonial {
  id: string;
  customerName: string;
  customerLocation: string;
  rating: number;
  title: string;
  content: string;
  packageId: string | null;
  packageTitle: string | null;
  travelDate: string | null;
  imageUrl: string | null;
  featured: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filterApproved, setFilterApproved] = useState<string>("all");
  const [filterFeatured, setFilterFeatured] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch("/api/admin/testimonials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError("Authentication failed. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch testimonials");
      }

      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (err) {
      setError("Failed to load testimonials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete testimonial");
      }

      setSuccessMessage("Testimonial deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchTestimonials();
    } catch (err) {
      setError("Failed to delete testimonial");
      console.error(err);
    }
  };

  const handleToggleApproved = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update testimonial");
      }

      setSuccessMessage(
        `Testimonial ${!currentStatus ? "approved" : "unapproved"}!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchTestimonials();
    } catch (err) {
      setError("Failed to update testimonial");
      console.error(err);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update testimonial");
      }

      setSuccessMessage(
        `Testimonial ${!currentStatus ? "featured" : "unfeatured"}!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchTestimonials();
    } catch (err) {
      setError("Failed to update testimonial");
      console.error(err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  // Apply filters
  const filteredTestimonials = testimonials.filter((testimonial) => {
    if (filterApproved === "approved" && !testimonial.approved) return false;
    if (filterApproved === "unapproved" && testimonial.approved) return false;
    if (filterFeatured === "featured" && !testimonial.featured) return false;
    if (filterFeatured === "not-featured" && testimonial.featured) return false;
    if (filterRating !== "all" && testimonial.rating !== parseInt(filterRating))
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Testimonials Management
            </h1>
            <Link
              href="/admin/testimonials/new"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Testimonial
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">
                Total Testimonials
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {testimonials.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Approved</div>
              <div className="text-3xl font-bold text-green-600">
                {testimonials.filter((t) => t.approved).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Featured</div>
              <div className="text-3xl font-bold text-yellow-600">
                {testimonials.filter((t) => t.featured).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Average Rating</div>
              <div className="text-3xl font-bold text-cyan-600">
                {testimonials.length > 0
                  ? (
                      testimonials.reduce((sum, t) => sum + t.rating, 0) /
                      testimonials.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-700 hover:text-red-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-700 hover:text-green-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Approved Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Status
              </label>
              <select
                value={filterApproved}
                onChange={(e) => setFilterApproved(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="unapproved">Unapproved</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Status
              </label>
              <select
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="all">All</option>
                <option value="featured">Featured</option>
                <option value="not-featured">Not Featured</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Testimonials Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title & Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Travel Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTestimonials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No testimonials found
                    </td>
                  </tr>
                ) : (
                  filteredTestimonials.map((testimonial) => (
                    <tr key={testimonial.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {testimonial.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {testimonial.customerLocation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StarRating rating={testimonial.rating} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {testimonial.title}
                        </div>
                        {testimonial.packageTitle && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {testimonial.packageTitle}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              testimonial.approved
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {testimonial.approved ? "Approved" : "Pending"}
                          </span>
                          {testimonial.featured && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(testimonial.travelDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/testimonials/${testimonial.id}`}
                              className="text-cyan-600 hover:text-cyan-900 font-medium flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(testimonial.id)}
                              className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleToggleApproved(
                                  testimonial.id,
                                  testimonial.approved
                                )
                              }
                              className={`${
                                testimonial.approved
                                  ? "text-gray-600 hover:text-gray-900"
                                  : "text-green-600 hover:text-green-900"
                              } font-medium flex items-center gap-1`}
                            >
                              {testimonial.approved ? (
                                <>
                                  <X className="w-4 h-4" />
                                  Unapprove
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleToggleFeatured(
                                  testimonial.id,
                                  testimonial.featured
                                )
                              }
                              className={`${
                                testimonial.featured
                                  ? "text-gray-600 hover:text-gray-900"
                                  : "text-yellow-600 hover:text-yellow-900"
                              } font-medium flex items-center gap-1`}
                            >
                              {testimonial.featured ? (
                                <>
                                  <Star className="w-4 h-4" />
                                  Unfeature
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4" />
                                  Feature
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
