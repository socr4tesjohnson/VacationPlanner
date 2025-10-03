"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  packageId: string | null;
  packageTitle: string | null;
  startDate: string | null;
  endDate: string | null;
  flexible: boolean;
  adults: number;
  children: number;
  budgetRange: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    fetchInquiry();
  }, [params.id, router]);

  const fetchInquiry = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/inquiries/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin");
        return;
      }

      const data = await response.json();
      setInquiry(data.inquiry);
    } catch (err) {
      setError("Failed to load inquiry");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!inquiry) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/inquiries/${params.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setInquiry({ ...inquiry, status: newStatus });
      } else {
        setError("Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inquiry...</p>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inquiry not found
          </h2>
          <Link
            href="/admin/dashboard"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Inquiry Details
              </h1>
              <p className="text-gray-600">ID: {inquiry.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Status Update */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Update Status
          </h2>
          <div className="flex gap-3 flex-wrap">
            {["new", "contacted", "quoted", "booked", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={updating || inquiry.status === status}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  inquiry.status === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed capitalize`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <div className="text-base font-medium text-gray-900">
                  {inquiry.firstName} {inquiry.lastName}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <a
                  href={`mailto:${inquiry.email}`}
                  className="text-base text-blue-600 hover:text-blue-800"
                >
                  {inquiry.email}
                </a>
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <a
                  href={`tel:${inquiry.phone}`}
                  className="text-base text-blue-600 hover:text-blue-800"
                >
                  {inquiry.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Trip Details
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Travel Dates</div>
                <div className="text-base font-medium text-gray-900">
                  {formatDate(inquiry.startDate)}
                </div>
                <div className="text-base font-medium text-gray-900">
                  to {formatDate(inquiry.endDate)}
                </div>
                {inquiry.flexible && (
                  <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Dates are flexible
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">Party Size</div>
                <div className="text-base font-medium text-gray-900">
                  {inquiry.adults} adult(s), {inquiry.children} child(ren)
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Budget Range</div>
                <div className="text-base font-medium text-gray-900">
                  {inquiry.budgetRange || "Not specified"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Package Interest */}
        {inquiry.packageTitle && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Interested Package
            </h2>
            <div className="text-base text-gray-900">{inquiry.packageTitle}</div>
          </div>
        )}

        {/* Message */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Message
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Inquiry Metadata
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Submitted</div>
              <div className="font-medium text-gray-900">
                {new Date(inquiry.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Last Updated</div>
              <div className="font-medium text-gray-900">
                {new Date(inquiry.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
