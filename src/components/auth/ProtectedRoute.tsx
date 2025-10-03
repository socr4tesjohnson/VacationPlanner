"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "MANAGER" | "AGENT";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Not authenticated, redirect to login
      router.push("/login");
    } else if (!isLoading && isAuthenticated && requiredRole) {
      // Check if user has required role
      if (user?.role !== requiredRole) {
        // User doesn't have required role, redirect to unauthorized page
        router.push("/login");
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  // Show loading state while checking authentication
  if (isLoading) {
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
            Checking authentication...
          </h2>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // If not authenticated or wrong role, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
}
