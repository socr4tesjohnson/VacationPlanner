import Link from "next/link";
import { prisma } from "@/lib/db";
import PackageCard from "@/components/packages/PackageCard";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import { Button } from "@/components/ui/Button";

async function getFeaturedPackages() {
  const packages = await prisma.vacationPackage.findMany({
    where: {
      featured: true,
      active: true,
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: {
      priority: "asc",
    },
    take: 3,
  });

  return packages;
}

async function getFeaturedTestimonials() {
  const testimonials = await prisma.testimonial.findMany({
    where: {
      featured: true,
      approved: true,
      active: true,
    },
    select: {
      id: true,
      customerName: true,
      customerLocation: true,
      rating: true,
      title: true,
      content: true,
      travelDate: true,
      featured: true,
      imageUrl: true,
      package: {
        select: {
          title: true,
          destination: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  return testimonials;
}

export default async function Home() {
  const featuredPackages = await getFeaturedPackages();
  const featuredTestimonials = await getFeaturedTestimonials();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-32 overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-sm font-semibold tracking-wide">
              with Whitney World Travel
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Your Personal Disney
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              & Universal Expert
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-white leading-relaxed">
            I&apos;m Laura Coleman, and I create stress-free, magical vacations
            perfectly tailored to your family&apos;s dreams and budget
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="primary"
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 focus:ring-white/50 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              <Link href="/vacations">Explore Vacations</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 backdrop-blur-sm focus:ring-white/50 transform hover:-translate-y-0.5"
            >
              <Link href="/contact">Start Planning with Laura</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Vacation Packages
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto">
              Handpicked destinations and experiences curated by our travel
              experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                title={pkg.title}
                slug={pkg.slug}
                destination={pkg.destination}
                shortDescription={pkg.shortDescription}
                startingPrice={pkg.startingPrice}
                nights={pkg.nights}
                days={pkg.days}
                imageUrl={pkg.images[0]?.url || "/placeholder.jpg"}
                imageAlt={
                  pkg.images[0]?.altText ||
                  `${pkg.title} vacation package in ${pkg.destination}`
                }
                type={pkg.type}
                featured={pkg.featured}
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <Button
              asChild
              variant="primary"
              size="lg"
              className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/50"
            >
              <Link href="/vacations">View All Packages</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Laura Coleman Travel
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto">
              Personal expert service backed by Whitney World Travel&apos;s
              proven track record
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Disney & Universal Expert
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Specialized knowledge of Disney, Universal, and cruise vacations
                that saves you time and money
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Stress-Free Planning
              </h3>
              <p className="text-gray-700 leading-relaxed">
                I handle all the details so you can focus on the excitement of
                your upcoming adventure
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Personalized Service
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Customized itineraries tailored to your family&apos;s needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Testimonials */}
      {featuredTestimonials.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Hear from Happy Travelers
              </h2>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                See what our customers say about their dream vacations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  customerName={testimonial.customerName}
                  customerLocation={testimonial.customerLocation}
                  rating={testimonial.rating}
                  title={testimonial.title}
                  content={testimonial.content}
                  travelDate={testimonial.travelDate?.toISOString() || null}
                  packageName={testimonial.package?.title || null}
                  packageDestination={testimonial.package?.destination || null}
                  imageUrl={testimonial.imageUrl}
                  featured={testimonial.featured}
                />
              ))}
            </div>

            <div className="text-center mt-16">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/50"
              >
                <Link href="/testimonials">View All Testimonials</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
