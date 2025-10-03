"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StarRating from "@/components/ui/StarRating";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Package {
  id: string;
  title: string;
}

export default function NewTestimonialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [formData, setFormData] = useState({
    customerName: "",
    customerLocation: "",
    rating: 5,
    title: "",
    content: "",
    packageId: "",
    travelDate: "",
    imageUrl: "",
    featured: false,
    approved: false,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch("/api/packages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.customerName.trim()) {
      setError("Customer name is required");
      setLoading(false);
      return;
    }

    if (!formData.customerLocation.trim()) {
      setError("Customer location is required");
      setLoading(false);
      return;
    }

    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          packageId: formData.packageId || null,
          travelDate: formData.travelDate || null,
          imageUrl: formData.imageUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create testimonial");
      }

      router.push("/admin/testimonials");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create testimonial");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/testimonials"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-800 mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Testimonials
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Add New Testimonial
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new customer testimonial for your vacation packages
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="John Doe"
            />
          </div>

          {/* Customer Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customerLocation"
              value={formData.customerLocation}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="New York, USA"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <StarRating
                rating={formData.rating}
                interactive={true}
                onChange={handleRatingChange}
                size="lg"
              />
              <span className="text-gray-600 font-medium">
                {formData.rating} / 5
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testimonial Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Amazing Experience!"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testimonial Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Share the customer's experience..."
            />
          </div>

          {/* Package */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Package
            </label>
            <select
              name="packageId"
              value={formData.packageId}
              onChange={handleChange}
              disabled={loadingPackages}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select a package (optional)</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title}
                </option>
              ))}
            </select>
          </div>

          {/* Travel Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Date
            </label>
            <input
              type="date"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="https://example.com/customer-photo.jpg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional: URL to customer photo or avatar
            </p>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                Featured Testimonial
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="approved"
                name="approved"
                checked={formData.approved}
                onChange={handleChange}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="approved" className="ml-2 text-sm font-medium text-gray-700">
                Approve Immediately
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Creating..." : "Create Testimonial"}
            </button>
            <Link
              href="/admin/testimonials"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
