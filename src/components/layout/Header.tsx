"use client";

/*
 * Spacing Scale Guide:
 * - Button padding: sm (px-4 py-2), md (px-6 py-3), lg (px-8 py-4)
 * - Section padding: py-12, py-16, py-20, py-24
 * - Container spacing: px-4 sm:px-6 lg:px-8
 * - Gap spacing: gap-2 (8px), gap-4 (16px), gap-6 (24px), gap-8 (32px)
 */

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Don't show header on login page or admin pages (admin has its own header)
  if (pathname === "/login" || pathname?.startsWith("/admin")) {
    return null;
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isMobileMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vacation Planner
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Home
            </Link>
            <Link
              href="/vacations"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Vacations
            </Link>
            <Link
              href="/testimonials"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Testimonials
            </Link>
            <Link
              href="/vacations?type=disney-park"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Disney Parks
            </Link>
            <Link
              href="/vacations?type=disney-cruise"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Disney Cruises
            </Link>
            <Link
              href="/vacations?type=cruise"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cruises
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button asChild variant="primary" size="sm">
              <Link href="/contact">Contact Us</Link>
            </Button>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <Button
                  asChild
                  variant="primary"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                >
                  <Link href="/admin/dashboard">Admin</Link>
                </Button>
                <Button onClick={logout} variant="ghost" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu */}
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="fixed top-16 left-0 right-0 bottom-0 bg-white z-50 md:hidden overflow-y-auto"
          >
            <nav className="flex flex-col p-4 space-y-2">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-base min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Home
              </Link>
              <Link
                href="/vacations"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-base min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Vacations
              </Link>
              <Link
                href="/testimonials"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-base min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Testimonials
              </Link>
              <Link
                href="/vacations?type=disney-park"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-base min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Disney Parks
              </Link>
              <Link
                href="/vacations?type=disney-cruise"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-base min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Disney Cruises
              </Link>
              <Link
                href="/vacations?type=cruise"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-base min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cruises
              </Link>

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/contact"
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all text-base min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Contact Us
                </Link>

                {isAuthenticated && user ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all text-base min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Admin
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all text-base min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all text-base min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
