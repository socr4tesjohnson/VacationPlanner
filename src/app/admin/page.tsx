"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Already logged in, go to dashboard
        router.push("/admin/dashboard");
      } else {
        // Not logged in, redirect to login page
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🌴
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Redirecting...
        </h2>
        <p className="text-gray-600">Please wait a moment</p>
      </div>
    </div>
  );
}
