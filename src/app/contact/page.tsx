"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import RecommendationResults from "@/components/forms/RecommendationResults";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  packageId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  flexible: z.boolean().default(true),
  adults: z.number().min(1, "At least 1 adult required").default(2),
  children: z.number().min(0).default(0),
  budgetRange: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface Recommendation {
  packageId: string;
  packageTitle: string;
  matchScore: number;
  reasoning: string;
  highlights: string[];
}

export default function ContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      adults: 2,
      children: 0,
      flexible: true,
    },
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form");
      }

      // Redirect to recommendations page with data
      if (result.recommendations && result.recommendations.length > 0) {
        const encodedData = encodeURIComponent(JSON.stringify(result.recommendations));
        router.push(`/recommendations?data=${encodedData}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit. Please try again.";
      setSubmitError(errorMessage);
      console.error("Form submission error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600">
            Ready to plan your dream vacation? Fill out the form below and
            our AI will find the perfect packages for you.
          </p>
        </div>

        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {submitError}
          </div>
        )}

        {isSubmitting ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 mb-6">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                🤖 AI is analyzing your preferences...
              </h3>
              <p className="text-gray-600 text-center">
                Our AI travel expert is finding the perfect vacation packages
                just for you
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg shadow-md p-8"
          >
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  {...register("firstName")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  {...register("lastName")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Trip Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Start Date
                </label>
                <div
                  onClick={() => startDateRef.current?.showPicker()}
                  className="cursor-pointer"
                >
                  <input
                    {...register("startDate", {
                      onChange: (e) => {
                        const selectedStart = e.target.value;
                        const currentEnd = watchedEndDate;

                        // Always update end date to be after start date
                        if (selectedStart) {
                          if (!currentEnd || currentEnd <= selectedStart) {
                            const nextDay = new Date(selectedStart);
                            nextDay.setDate(nextDay.getDate() + 1);
                            setValue("endDate", nextDay.toISOString().split('T')[0]);
                          }
                        }
                      }
                    })}
                    ref={startDateRef}
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred End Date
                </label>
                <div
                  onClick={() => endDateRef.current?.showPicker()}
                  className="cursor-pointer"
                >
                  <input
                    {...register("endDate")}
                    ref={endDateRef}
                    type="date"
                    min={watchedStartDate || undefined}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adults
                </label>
                <input
                  {...register("adults", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.adults && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.adults.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children
                </label>
                <input
                  {...register("children", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <select
                  {...register("budgetRange")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select budget range</option>
                  <option value="under-2000">Under $2,000</option>
                  <option value="2000-5000">$2,000 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="over-10000">Over $10,000</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    {...register("flexible")}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    My travel dates are flexible
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about your dream vacation *
            </label>
            <textarea
              {...register("message")}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What are you looking for in your vacation? Any special requests or requirements?"
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Send Inquiry"}
          </button>
          </form>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">
            Or reach us directly:
          </p>
          <p>Email: info@vacationplanner.com | Phone: (555) 123-4567</p>
        </div>
      </div>
    </div>
  );
}
