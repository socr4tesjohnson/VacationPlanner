"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  startDate: string | null;
  endDate: string | null;
  budgetRange: string | null;
  message: string;
  status: string;
  createdAt: string;
  packageTitle: string | null;
}

interface Booking {
  id: string;
  confirmationNumber: string;
  departureDate: string;
  returnDate: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("session_token");

      // Fetch inquiries
      const inquiriesResponse = await fetch("/api/admin/inquiries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (inquiriesResponse.status === 401) {
        setError("Authentication failed. Please log in again.");
        return;
      }

      const inquiriesData = await inquiriesResponse.json();
      setInquiries(inquiriesData.inquiries || []);

      // Fetch bookings
      const bookingsResponse = await fetch("/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings || []);
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate currently traveling customers
  const currentlyTraveling = bookings.filter(booking => {
    const now = new Date();
    const departure = new Date(booking.departureDate);
    const returnDate = new Date(booking.returnDate);
    return booking.status === 'CONFIRMED' && departure <= now && now <= returnDate;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      quoted: "bg-purple-100 text-purple-800",
      booked: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredInquiries =
    filter === "all"
      ? inquiries
      : inquiries.filter((inq) => inq.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Inquiries Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and track all vacation planning inquiries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Inquiries</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {inquiries.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">New</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {inquiries.filter((i) => i.status === "new").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Contacted</div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {inquiries.filter((i) => i.status === "contacted").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Booked</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {inquiries.filter((i) => i.status === "booked").length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-white/90 mb-1 flex items-center gap-1">
              ✈️ On Trip Now
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {currentlyTraveling.length}
            </div>
          </div>
        </div>

        {/* Currently Traveling Section */}
        {currentlyTraveling.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              ✈️ Currently Traveling ({currentlyTraveling.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentlyTraveling.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg p-4 shadow">
                  <div className="font-semibold text-gray-900">
                    {booking.customer.firstName} {booking.customer.lastName}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {booking.confirmationNumber}
                  </div>
                  <div className="text-xs text-purple-600 mt-2">
                    Returns: {formatDate(booking.returnDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({inquiries.length})
            </button>
            <button
              onClick={() => setFilter("new")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "new"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              New ({inquiries.filter((i) => i.status === "new").length})
            </button>
            <button
              onClick={() => setFilter("contacted")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "contacted"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Contacted ({inquiries.filter((i) => i.status === "contacted").length})
            </button>
            <button
              onClick={() => setFilter("booked")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "booked"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Booked ({inquiries.filter((i) => i.status === "booked").length})
            </button>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Details
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No inquiries found
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {inquiry.firstName} {inquiry.lastName}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {inquiry.adults} adult(s), {inquiry.children} child(ren)
                        </div>
                        {/* Show on mobile only */}
                        <div className="md:hidden text-xs text-gray-500 mt-1">
                          {inquiry.email}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {inquiry.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inquiry.phone}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(inquiry.startDate)} - {formatDate(inquiry.endDate)}
                        </div>
                        {inquiry.packageTitle && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {inquiry.packageTitle}
                          </div>
                        )}
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {inquiry.budgetRange || "Not specified"}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            inquiry.status
                          )}`}
                        >
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/inquiries/${inquiry.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View
                        </Link>
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
