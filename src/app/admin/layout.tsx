"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white shadow-md border-b-2 border-cyan-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo & Navigation */}
              <div className="flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent hover:from-cyan-700 hover:to-blue-700 transition-all"
                >
                  🌴 Vacation Planner
                </Link>
                <nav className="hidden md:flex space-x-4">
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-700 hover:text-cyan-600 font-medium px-3 py-2 rounded-lg hover:bg-cyan-50 transition-all"
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/admin/packages/new"
                    className="text-gray-700 hover:text-cyan-600 font-medium px-3 py-2 rounded-lg hover:bg-cyan-50 transition-all"
                  >
                    ➕ Add Package
                  </Link>
                  <Link
                    href="/admin/testimonials"
                    className="text-gray-700 hover:text-cyan-600 font-medium px-3 py-2 rounded-lg hover:bg-cyan-50 transition-all"
                  >
                    ⭐ Testimonials
                  </Link>
                </nav>
              </div>

              {/* User Info & Logout */}
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 rounded-full border-2 border-cyan-200">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{user.role}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </div>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-full font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-lg flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
