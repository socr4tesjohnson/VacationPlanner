import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Users with hashed passwords
  console.log("Creating users...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@vacationplanner.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      password: adminPassword,
      active: true,
    },
  });

  const agentPassword = await bcrypt.hash("agent123", 10);
  const agent = await prisma.user.create({
    data: {
      email: "agent@vacationplanner.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "AGENT",
      password: agentPassword,
      active: true,
    },
  });

  const managerPassword = await bcrypt.hash("manager123", 10);
  const manager = await prisma.user.create({
    data: {
      email: "manager@vacationplanner.com",
      firstName: "John",
      lastName: "Doe",
      role: "MANAGER",
      password: managerPassword,
      active: true,
    },
  });

  console.log("✅ Created 3 users (admin, agent, manager)");
  console.log("Seeding vacation packages...");

  // Disney Park Packages
  const magicKingdom = await prisma.vacationPackage.create({
    data: {
      title: "Magic Kingdom 4-Day Adventure",
      slug: "magic-kingdom-4-day-adventure",
      type: "disney-park",
      destination: "Walt Disney World, Orlando, FL",
      shortDescription:
        "Experience the magic with 4 days at Disney's most iconic park",
      description:
        "Immerse yourself in the enchantment of Magic Kingdom with this 4-day adventure. Stay at a Disney resort, enjoy park hopper access, and create unforgettable memories with your family. This package includes accommodations, park tickets, FastPass+ reservations, and complimentary planning services from our Disney specialists.",
      startingPrice: 1299.0,
      currency: "USD",
      pricePerPerson: true,
      deposit: 200.0,
      nights: 3,
      days: 4,
      minTravelers: 1,
      maxTravelers: 8,
      inclusions: JSON.stringify([
        "4-day park hopper tickets",
        "3 nights resort accommodation",
        "FastPass+ reservations",
        "Complimentary planning services",
        "Magic Kingdom exclusive experiences",
      ]),
      exclusions: JSON.stringify([
        "Airfare",
        "Meals (unless specified)",
        "Travel insurance",
        "Souvenirs and personal expenses",
      ]),
      featured: true,
      active: true,
      tags: JSON.stringify(["disney", "orlando", "family", "theme-park"]),
      category: "Disney Parks",
      priority: 1,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1566996533071-2159cfad5224?w=800",
            altText: "Cinderella Castle at Magic Kingdom",
            caption: "The iconic Cinderella Castle",
            isPrimary: true,
            order: 0,
            width: 800,
            height: 600,
          },
        ],
      },
      itineraries: {
        create: [
          {
            dayNumber: 1,
            title: "Arrival & Magic Kingdom Welcome",
            description:
              "Check into your Disney resort and head to Magic Kingdom for an evening of magic",
            activities: JSON.stringify([
              "Resort check-in",
              "Welcome orientation",
              "Evening at Magic Kingdom",
              "Fireworks spectacular",
            ]),
            meals: JSON.stringify(["Dinner at Be Our Guest Restaurant"]),
          },
          {
            dayNumber: 2,
            title: "Full Day at Magic Kingdom",
            description: "Explore all the lands and attractions",
            activities: JSON.stringify([
              "Early park entry",
              "Adventureland exploration",
              "Frontierland rides",
              "Character meet and greets",
            ]),
            meals: JSON.stringify(["Breakfast", "Lunch", "Dinner"]),
          },
        ],
      },
    },
  });

  const disneylandPackage = await prisma.vacationPackage.create({
    data: {
      title: "Disneyland California Dream",
      slug: "disneyland-california-dream",
      type: "disney-park",
      destination: "Disneyland Resort, Anaheim, CA",
      shortDescription: "5 days exploring both Disneyland and California Adventure",
      description:
        "Discover the original Disneyland park and California Adventure with this comprehensive 5-day package. Perfect for families wanting to experience both parks with comfortable accommodations and expert planning assistance.",
      startingPrice: 1499.0,
      pricePerPerson: true,
      deposit: 250.0,
      nights: 4,
      days: 5,
      minTravelers: 2,
      maxTravelers: 6,
      inclusions: JSON.stringify([
        "5-day park hopper tickets",
        "4 nights at Disneyland Hotel",
        "Early park admission",
        "Disney Genie+ service",
        "Character dining experience",
      ]),
      exclusions: JSON.stringify([
        "Airfare",
        "Ground transportation",
        "Travel insurance",
      ]),
      featured: true,
      active: true,
      tags: JSON.stringify(["disney", "california", "disneyland", "family"]),
      category: "Disney Parks",
      priority: 2,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1519642928-4197c01e9847?w=800",
            altText: "Disneyland Castle",
            caption: "Sleeping Beauty Castle at Disneyland",
            isPrimary: true,
            order: 0,
            width: 800,
            height: 600,
          },
        ],
      },
    },
  });

  // Disney Cruise Packages
  const caribbeanCruise = await prisma.vacationPackage.create({
    data: {
      title: "Disney Caribbean Cruise - 7 Nights",
      slug: "disney-caribbean-cruise-7-nights",
      type: "disney-cruise",
      destination: "Eastern Caribbean",
      shortDescription:
        "Sail the Caribbean on Disney Cruise Line with stops at tropical ports",
      description:
        "Set sail on an unforgettable 7-night Eastern Caribbean cruise aboard a Disney ship. Visit stunning ports including Castaway Cay (Disney's private island), St. Thomas, and St. Maarten. Enjoy world-class entertainment, character experiences, and all the amenities Disney is known for.",
      startingPrice: 2499.0,
      pricePerPerson: true,
      deposit: 500.0,
      nights: 7,
      days: 8,
      minTravelers: 2,
      maxTravelers: 5,
      inclusions: JSON.stringify([
        "7-night cruise accommodation",
        "All meals and snacks onboard",
        "Entertainment and shows",
        "Kids clubs and activities",
        "Castaway Cay beach day",
        "Character meet and greets",
      ]),
      exclusions: JSON.stringify([
        "Airfare to/from port",
        "Shore excursions",
        "Alcoholic beverages",
        "Spa services",
        "Gratuities",
      ]),
      featured: true,
      active: true,
      tags: JSON.stringify(["disney", "cruise", "caribbean", "family", "beach"]),
      category: "Disney Cruise",
      priority: 3,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
            altText: "Disney Cruise Ship",
            caption: "Disney Cruise Line ship at sea",
            isPrimary: true,
            order: 0,
            width: 800,
            height: 600,
          },
        ],
      },
      itineraries: {
        create: [
          {
            dayNumber: 1,
            title: "Embarkation Day - Port Canaveral",
            description: "Board your Disney cruise ship and set sail",
            activities: JSON.stringify([
              "Ship boarding and check-in",
              "Sail away celebration",
              "Dinner and evening entertainment",
            ]),
            meals: JSON.stringify(["Lunch", "Dinner"]),
          },
          {
            dayNumber: 2,
            title: "At Sea",
            description: "Enjoy all the ship amenities",
            activities: JSON.stringify([
              "Pool deck activities",
              "Character meet and greets",
              "Broadway-style shows",
              "Kids club activities",
            ]),
            meals: JSON.stringify(["Breakfast", "Lunch", "Dinner"]),
          },
          {
            dayNumber: 3,
            title: "Castaway Cay",
            description: "Disney's private island paradise",
            activities: JSON.stringify([
              "Beach activities",
              "Snorkeling",
              "Island BBQ",
              "Water sports",
            ]),
            meals: JSON.stringify(["Breakfast", "Lunch", "Dinner"]),
          },
        ],
      },
    },
  });

  // Regular Cruise Packages
  const alaskanCruise = await prisma.vacationPackage.create({
    data: {
      title: "Alaskan Adventure Cruise",
      slug: "alaskan-adventure-cruise",
      type: "cruise",
      destination: "Alaska Inside Passage",
      shortDescription: "7-night cruise through Alaska's stunning landscapes",
      description:
        "Experience the breathtaking beauty of Alaska on this 7-night cruise through the Inside Passage. Visit charming ports like Juneau, Skagway, and Ketchikan while enjoying glacier viewing and wildlife spotting. Perfect for families seeking adventure and natural wonders.",
      startingPrice: 1899.0,
      pricePerPerson: true,
      deposit: 400.0,
      nights: 7,
      days: 8,
      minTravelers: 2,
      maxTravelers: 4,
      inclusions: JSON.stringify([
        "7-night cruise accommodation",
        "All meals onboard",
        "Entertainment",
        "Port stops",
        "Glacier viewing",
      ]),
      exclusions: JSON.stringify([
        "Airfare",
        "Shore excursions",
        "Beverages",
        "Gratuities",
      ]),
      featured: false,
      active: true,
      tags: JSON.stringify(["cruise", "alaska", "nature", "adventure"]),
      category: "Cruises",
      priority: 4,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800",
            altText: "Alaska Cruise Ship",
            caption: "Cruise ship sailing through Alaskan waters",
            isPrimary: true,
            order: 0,
            width: 800,
            height: 600,
          },
        ],
      },
    },
  });

  const bahamasCruise = await prisma.vacationPackage.create({
    data: {
      title: "Bahamas Family Getaway - 3 Nights",
      slug: "bahamas-family-getaway",
      type: "cruise",
      destination: "Bahamas",
      shortDescription: "Quick 3-night cruise to the beautiful Bahamas",
      description:
        "Perfect for a quick family getaway! This 3-night cruise takes you to the stunning Bahamas with stops at Nassau and a private island. Ideal for first-time cruisers or families looking for a short vacation.",
      startingPrice: 599.0,
      pricePerPerson: true,
      deposit: 100.0,
      nights: 3,
      days: 4,
      minTravelers: 2,
      maxTravelers: 6,
      inclusions: JSON.stringify([
        "3-night cruise accommodation",
        "All meals onboard",
        "Entertainment",
        "Pool and water activities",
      ]),
      exclusions: JSON.stringify([
        "Port parking",
        "Shore excursions",
        "Beverages",
        "Gratuities",
      ]),
      featured: false,
      active: true,
      tags: JSON.stringify(["cruise", "bahamas", "family", "beach", "short-trip"]),
      category: "Cruises",
      priority: 5,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800",
            altText: "Bahamas Beach",
            caption: "Beautiful Bahamas beaches",
            isPrimary: true,
            order: 0,
            width: 800,
            height: 600,
          },
        ],
      },
    },
  });

  console.log("✅ Created 5 vacation packages");

  // Create Customers
  console.log("Creating customers...");

  const customer1 = await prisma.customer.create({
    data: {
      email: "sarah.johnson@email.com",
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "+1-555-0123",
      status: "vip",
      preferences: JSON.stringify({
        communicationPreferences: ["email", "phone"],
        interests: ["disney-parks", "disney-cruise", "family-vacations"],
        travelStyle: "luxury",
        specialRequests: "Prefers ocean-view rooms, has a 5-year-old daughter who loves princesses",
      }),
      notes: "VIP customer - has booked 3 Disney vacations with us. Always requests princess-themed experiences. Very satisfied with our service.",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      email: "michael.chen@email.com",
      firstName: "Michael",
      lastName: "Chen",
      phone: "+1-555-0456",
      status: "active",
      preferences: JSON.stringify({
        communicationPreferences: ["email"],
        interests: ["cruises", "beach-vacations", "adventure"],
        travelStyle: "family",
        specialRequests: "Budget-conscious, prefers all-inclusive packages",
      }),
      notes: "First-time customer, interested in Caribbean cruises. Requested detailed itinerary information.",
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      email: "emily.rodriguez@email.com",
      firstName: "Emily",
      lastName: "Rodriguez",
      phone: "+1-555-0789",
      status: "active",
      preferences: JSON.stringify({
        communicationPreferences: ["email", "sms"],
        interests: ["disney-parks", "theme-parks"],
        travelStyle: "adventure",
        specialRequests: "Loves thrill rides and character dining experiences",
      }),
      notes: "Enthusiastic Disney fan. Looking to visit both Disneyland and Disney World within the next year.",
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      email: "robert.williams@email.com",
      firstName: "Robert",
      lastName: "Williams",
      phone: "+1-555-0321",
      status: "active",
      preferences: JSON.stringify({
        communicationPreferences: ["phone"],
        interests: ["cruises", "nature", "adventure"],
        travelStyle: "adventure",
        specialRequests: "Interested in Alaska cruise with wildlife viewing opportunities",
      }),
      notes: "Prefers phone communication. Wants to celebrate 25th wedding anniversary with Alaska cruise.",
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      email: "jessica.brown@email.com",
      firstName: "Jessica",
      lastName: "Brown",
      phone: null, // Some customers may not provide phone numbers
      status: "inactive",
      preferences: JSON.stringify({
        communicationPreferences: ["email"],
        interests: ["beach-vacations", "short-trips"],
        travelStyle: "budget",
        specialRequests: null,
      }),
      notes: "Inquired about Bahamas cruise 6 months ago but did not book. May follow up in future.",
    },
  });

  console.log("✅ Created 5 customers");

  // Create Contact Inquiries linked to customers
  console.log("Creating contact inquiries...");

  await prisma.contactInquiry.create({
    data: {
      customerId: customer1.id,
      firstName: customer1.firstName,
      lastName: customer1.lastName,
      email: customer1.email,
      phone: customer1.phone || "",
      packageId: magicKingdom.id,
      packageTitle: magicKingdom.title,
      startDate: new Date("2025-12-15"),
      endDate: new Date("2025-12-19"),
      flexible: false,
      adults: 2,
      children: 1,
      childAges: JSON.stringify([5]),
      budgetRange: "$5000-$7500",
      message: "We're interested in a magical Christmas vacation at Magic Kingdom for our family. Our daughter loves princesses!",
      status: "quoted",
      source: "website",
    },
  });

  await prisma.contactInquiry.create({
    data: {
      customerId: customer2.id,
      firstName: customer2.firstName,
      lastName: customer2.lastName,
      email: customer2.email,
      phone: customer2.phone || "",
      packageId: bahamasCruise.id,
      packageTitle: bahamasCruise.title,
      startDate: new Date("2025-11-10"),
      endDate: new Date("2025-11-14"),
      flexible: true,
      adults: 2,
      children: 2,
      childAges: JSON.stringify([8, 10]),
      budgetRange: "$2500-$5000",
      message: "Looking for a family-friendly cruise to the Bahamas. This would be our first cruise!",
      status: "contacted",
      source: "google",
    },
  });

  await prisma.contactInquiry.create({
    data: {
      customerId: customer3.id,
      firstName: customer3.firstName,
      lastName: customer3.lastName,
      email: customer3.email,
      phone: customer3.phone || "",
      packageId: disneylandPackage.id,
      packageTitle: disneylandPackage.title,
      startDate: new Date("2025-10-20"),
      endDate: new Date("2025-10-25"),
      flexible: true,
      adults: 2,
      children: 0,
      childAges: JSON.stringify([]),
      budgetRange: "$5000-$7500",
      message: "Planning a Disneyland trip for Halloween time! We're huge Disney fans and want to experience all the seasonal offerings.",
      status: "new",
      source: "website",
    },
  });

  await prisma.contactInquiry.create({
    data: {
      customerId: customer4.id,
      firstName: customer4.firstName,
      lastName: customer4.lastName,
      email: customer4.email,
      phone: customer4.phone || "",
      packageId: alaskanCruise.id,
      packageTitle: alaskanCruise.title,
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-09-09"),
      flexible: false,
      adults: 2,
      children: 0,
      childAges: JSON.stringify([]),
      budgetRange: "$7500-$10000",
      message: "We want to celebrate our 25th wedding anniversary with an Alaskan cruise. Looking for the best glacier viewing opportunities!",
      status: "new",
      source: "referral",
    },
  });

  // Create an inquiry without a customer (walk-in or one-time inquiry)
  await prisma.contactInquiry.create({
    data: {
      firstName: "David",
      lastName: "Martinez",
      email: "david.martinez@email.com",
      phone: "+1-555-9999",
      packageId: caribbeanCruise.id,
      packageTitle: caribbeanCruise.title,
      startDate: new Date("2025-08-15"),
      endDate: new Date("2025-08-23"),
      flexible: true,
      adults: 4,
      children: 3,
      childAges: JSON.stringify([6, 9, 12]),
      budgetRange: "$10000+",
      message: "Large family interested in Disney Caribbean cruise. Need information about family suites.",
      status: "new",
      source: "phone",
    },
  });

  console.log("✅ Created 5 contact inquiries (4 linked to customers, 1 standalone)");

  // Create Bookings with Travelers
  console.log("Creating bookings...");

  // Helper function to generate confirmation number
  const generateConfirmationNumber = () => {
    const year = new Date().getFullYear();
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `VPL-${year}-${randomString}`;
  };

  // Booking 1: Confirmed Disney World booking for Sarah Johnson (VIP customer)
  const booking1 = await prisma.booking.create({
    data: {
      confirmationNumber: generateConfirmationNumber(),
      customerId: customer1.id,
      packageId: magicKingdom.id,
      userId: agent.id,
      status: "CONFIRMED",
      departureDate: new Date("2025-12-15"),
      returnDate: new Date("2025-12-19"),
      totalPrice: 3897.0, // 3 people x $1299
      depositPaid: 600.0, // $200 deposit x 3
      balanceDue: 3297.0, // $3897 - $600
      adults: 2,
      children: 1,
      specialRequests: "Princess-themed room decoration, character dining reservation for Cinderella's Royal Table",
      notes: "VIP customer - ensure all princess experiences are included. Room upgrade approved.",
      travelers: {
        create: [
          {
            firstName: "Sarah",
            lastName: "Johnson",
            dateOfBirth: new Date("1988-04-15"),
            age: 37,
            isChild: false,
            specialNeeds: null,
          },
          {
            firstName: "James",
            lastName: "Johnson",
            dateOfBirth: new Date("1985-08-22"),
            age: 40,
            isChild: false,
            specialNeeds: null,
          },
          {
            firstName: "Emma",
            lastName: "Johnson",
            dateOfBirth: new Date("2020-03-10"),
            age: 5,
            isChild: true,
            specialNeeds: "Loves princesses, prefers character meet-and-greets",
          },
        ],
      },
    },
  });

  // Booking 2: Pending Bahamas cruise for Michael Chen (new customer)
  const booking2 = await prisma.booking.create({
    data: {
      confirmationNumber: generateConfirmationNumber(),
      customerId: customer2.id,
      packageId: bahamasCruise.id,
      userId: agent.id,
      status: "PENDING",
      departureDate: new Date("2025-11-10"),
      returnDate: new Date("2025-11-14"),
      totalPrice: 2396.0, // 4 people x $599
      depositPaid: 400.0, // $100 deposit x 4
      balanceDue: 1996.0,
      adults: 2,
      children: 2,
      specialRequests: "Family cabin with connecting rooms if possible",
      notes: "First-time cruisers - provide detailed pre-cruise information packet",
      travelers: {
        create: [
          {
            firstName: "Michael",
            lastName: "Chen",
            dateOfBirth: new Date("1982-11-05"),
            age: 43,
            isChild: false,
            specialNeeds: null,
          },
          {
            firstName: "Lisa",
            lastName: "Chen",
            dateOfBirth: new Date("1984-02-18"),
            age: 41,
            isChild: false,
            specialNeeds: null,
          },
          {
            firstName: "Kevin",
            lastName: "Chen",
            dateOfBirth: new Date("2015-06-12"),
            age: 10,
            isChild: true,
            specialNeeds: null,
          },
          {
            firstName: "Sophia",
            lastName: "Chen",
            dateOfBirth: new Date("2017-09-25"),
            age: 8,
            isChild: true,
            specialNeeds: "Food allergies - peanuts and shellfish",
          },
        ],
      },
    },
  });

  // Booking 3: Confirmed Disneyland package for Emily Rodriguez
  const booking3 = await prisma.booking.create({
    data: {
      confirmationNumber: generateConfirmationNumber(),
      customerId: customer3.id,
      packageId: disneylandPackage.id,
      userId: manager.id,
      status: "CONFIRMED",
      departureDate: new Date("2025-10-20"),
      returnDate: new Date("2025-10-25"),
      totalPrice: 2998.0, // 2 people x $1499
      depositPaid: 500.0, // $250 deposit x 2
      balanceDue: 2498.0,
      adults: 2,
      children: 0,
      specialRequests: "Halloween season - request Oogie Boogie Bash tickets, thrill ride FastPass priority",
      notes: "Enthusiastic Disney fans - recommend all seasonal offerings and special events",
      travelers: {
        create: [
          {
            firstName: "Emily",
            lastName: "Rodriguez",
            dateOfBirth: new Date("1992-07-08"),
            age: 33,
            isChild: false,
            specialNeeds: null,
          },
          {
            firstName: "Carlos",
            lastName: "Rodriguez",
            dateOfBirth: new Date("1990-12-14"),
            age: 34,
            isChild: false,
            specialNeeds: null,
          },
        ],
      },
    },
  });

  // Booking 4: Completed Caribbean cruise from past date
  const booking4 = await prisma.booking.create({
    data: {
      confirmationNumber: generateConfirmationNumber(),
      customerId: customer1.id, // Sarah Johnson (repeat customer)
      packageId: caribbeanCruise.id,
      userId: agent.id,
      status: "COMPLETED",
      departureDate: new Date("2025-01-15"),
      returnDate: new Date("2025-01-23"),
      totalPrice: 7497.0, // 3 people x $2499
      depositPaid: 1500.0, // $500 deposit x 3
      balanceDue: 0.0, // Fully paid
      adults: 2,
      children: 1,
      specialRequests: "Verandah stateroom, princess character dining",
      notes: "Excellent customer - left 5-star review. Referred 2 friends.",
      travelers: {
        create: [
          {
            firstName: "Sarah",
            lastName: "Johnson",
            dateOfBirth: new Date("1988-04-15"),
            age: 36,
            isChild: false,
            specialNeeds: null,
          },
          {
            firstName: "James",
            lastName: "Johnson",
            dateOfBirth: new Date("1985-08-22"),
            age: 39,
            isChild: false,
            specialNeeds: null,
          },
          {
            firstName: "Emma",
            lastName: "Johnson",
            dateOfBirth: new Date("2020-03-10"),
            age: 4,
            isChild: true,
            specialNeeds: "Loves Elsa and Anna, requested Frozen character meet",
          },
        ],
      },
    },
  });

  // Booking 5: Cancelled Alaska cruise for Robert Williams
  const booking5 = await prisma.booking.create({
    data: {
      confirmationNumber: generateConfirmationNumber(),
      customerId: customer4.id,
      packageId: alaskanCruise.id,
      userId: manager.id,
      status: "CANCELLED",
      departureDate: new Date("2025-07-01"),
      returnDate: new Date("2025-07-09"),
      totalPrice: 3798.0, // 2 people x $1899
      depositPaid: 800.0, // $400 deposit x 2
      balanceDue: 2998.0,
      adults: 2,
      children: 0,
      specialRequests: "Anniversary celebration, glacier viewing priority",
      notes: "Cancelled due to health concerns. Deposit refunded. Customer wants to rebook for 2026.",
      travelers: {
        create: [
          {
            firstName: "Robert",
            lastName: "Williams",
            dateOfBirth: new Date("1970-05-20"),
            age: 55,
            isChild: false,
            specialNeeds: null,
          },
          {
            firstName: "Margaret",
            lastName: "Williams",
            dateOfBirth: new Date("1972-09-15"),
            age: 53,
            isChild: false,
            specialNeeds: "Mobility assistance - wheelchair accessible cabin required",
          },
        ],
      },
    },
  });

  console.log("✅ Created 5 bookings with travelers");
  console.log("  - 2 CONFIRMED bookings (future dates)");
  console.log("  - 1 PENDING booking");
  console.log("  - 1 COMPLETED booking (past date)");
  console.log("  - 1 CANCELLED booking");

  // Create Testimonials
  console.log("Creating testimonials...");

  // Featured testimonials (shown on homepage)
  await prisma.testimonial.create({
    data: {
      customerName: "Sarah J.",
      customerId: customer1.id,
      customerLocation: "Orlando, FL",
      packageId: caribbeanCruise.id,
      rating: 5,
      title: "Absolutely Magical Caribbean Cruise!",
      content: "Our Disney Caribbean cruise exceeded all expectations! The planning service made everything seamless from start to finish. Our daughter had the time of her life meeting all the characters, and the private island stop at Castaway Cay was pure paradise. We can't wait to book our next adventure!",
      travelDate: new Date("2025-01-15"),
      featured: true,
      approved: true,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400",
    },
  });

  await prisma.testimonial.create({
    data: {
      customerName: "Michael & Lisa Chen",
      customerId: customer2.id,
      customerLocation: "Family of 4 from Texas",
      packageId: bahamasCruise.id,
      rating: 5,
      title: "Perfect First Cruise Experience!",
      content: "As first-time cruisers, we were a bit nervous, but the VacationPlanner team made everything so easy! The Bahamas cruise was perfect for our family. The kids loved the water slides and pool activities, and we enjoyed the beautiful beaches. Great value for money and unforgettable memories!",
      travelDate: new Date("2025-11-10"),
      featured: true,
      approved: true,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400",
    },
  });

  await prisma.testimonial.create({
    data: {
      customerName: "Emily R.",
      customerId: customer3.id,
      customerLocation: "Los Angeles, CA",
      packageId: disneylandPackage.id,
      rating: 5,
      title: "Disney Dreams Do Come True!",
      content: "The Halloween season at Disneyland was spectacular! Our VacationPlanner specialist secured us tickets to Oogie Boogie Bash and made dining reservations at all the best spots. We experienced everything on our bucket list and more. Five stars all the way!",
      travelDate: new Date("2025-10-20"),
      featured: true,
      approved: true,
      active: true,
      imageUrl: null,
    },
  });

  // Regular approved testimonials (not featured)
  await prisma.testimonial.create({
    data: {
      customerName: "Robert & Margaret Williams",
      customerId: customer4.id,
      customerLocation: "Seattle, WA",
      packageId: alaskanCruise.id,
      rating: 4,
      title: "Stunning Alaskan Adventure!",
      content: "The glacier viewing was absolutely breathtaking! While we had to cancel this particular booking, the team was so understanding and helpful. They've already helped us rebook for next year. Can't wait to finally take this amazing trip!",
      travelDate: null,
      featured: false,
      approved: true,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400",
    },
  });

  await prisma.testimonial.create({
    data: {
      customerName: "Jennifer & David Martinez",
      customerId: null, // Not linked to a customer record
      customerLocation: "Miami, FL",
      packageId: magicKingdom.id,
      rating: 5,
      title: "Magic Kingdom Made Our Christmas!",
      content: "Our family Christmas vacation at Magic Kingdom was pure magic! The decorations, the shows, the festive atmosphere - everything was perfect. The VacationPlanner team thought of every detail. Our kids are already begging to go back!",
      travelDate: new Date("2024-12-20"),
      featured: false,
      approved: true,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1513026705753-bc3fffca8bf4?w=400",
    },
  });

  await prisma.testimonial.create({
    data: {
      customerName: "Amanda Thompson",
      customerId: null,
      customerLocation: "Chicago, IL",
      packageId: disneylandPackage.id,
      rating: 5,
      title: "Best Family Vacation Ever!",
      content: "From the moment we arrived at Disneyland to our last day, everything was perfectly planned. The VacationPlanner team secured us the best FastPass times and restaurant reservations. We got to experience everything we wanted without the stress of planning it ourselves!",
      travelDate: new Date("2025-03-10"),
      featured: false,
      approved: true,
      active: true,
      imageUrl: null,
    },
  });

  await prisma.testimonial.create({
    data: {
      customerName: "Paul & Rachel Anderson",
      customerId: null,
      customerLocation: "Denver, CO",
      packageId: caribbeanCruise.id,
      rating: 5,
      title: "Honeymoon Dreams Come True!",
      content: "We chose the Disney Caribbean cruise for our honeymoon and it was absolutely perfect! The romantic dinners, the beautiful sunsets, and the incredible service made it unforgettable. Thank you VacationPlanner for helping us start our marriage with such wonderful memories!",
      travelDate: new Date("2025-02-14"),
      featured: false,
      approved: true,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?w=400",
    },
  });

  await prisma.testimonial.create({
    data: {
      customerName: "Thomas & Karen Lee",
      customerId: null,
      customerLocation: "Boston, MA",
      packageId: bahamasCruise.id,
      rating: 4,
      title: "Great Quick Getaway!",
      content: "The 3-night Bahamas cruise was exactly what we needed - a quick escape from the cold weather! The ship was beautiful, the food was delicious, and the Nassau stop was fantastic. Only wish we had booked a longer cruise! Will definitely use VacationPlanner again.",
      travelDate: new Date("2025-01-05"),
      featured: false,
      approved: true,
      active: true,
      imageUrl: null,
    },
  });

  // One with a 3-star rating (less common, shows variety)
  await prisma.testimonial.create({
    data: {
      customerName: "Mark Stevens",
      customerId: null,
      customerLocation: "Phoenix, AZ",
      packageId: alaskanCruise.id,
      rating: 3,
      title: "Good Experience, Some Room for Improvement",
      content: "The Alaskan cruise was beautiful and the VacationPlanner team was helpful with booking. The glacier views were stunning. However, some of the shore excursions we booked separately didn't quite meet our expectations. Overall a good trip, but not everything was perfect.",
      travelDate: new Date("2024-08-15"),
      featured: false,
      approved: true,
      active: true,
      imageUrl: null,
    },
  });

  // One unapproved testimonial (pending admin review)
  await prisma.testimonial.create({
    data: {
      customerName: "Jessica Brown",
      customerId: customer5.id,
      customerLocation: "Atlanta, GA",
      packageId: bahamasCruise.id,
      rating: 5,
      title: "Considering a Cruise!",
      content: "I'm very interested in booking a Bahamas cruise with VacationPlanner. The packages look amazing and I've heard great things from friends. Looking forward to working with the team!",
      travelDate: null,
      featured: false,
      approved: false, // Not yet approved
      active: true,
      imageUrl: null,
    },
  });

  console.log("✅ Created 10 testimonials");
  console.log("  - 3 featured testimonials (homepage)");
  console.log("  - 6 regular approved testimonials");
  console.log("  - 1 unapproved testimonial (pending review)");
  console.log("  - Ratings: 8 five-star, 1 four-star, 1 three-star");

  console.log("✅ Database seeded successfully!");
  console.log(`Created 3 users, 5 vacation packages, 5 customers, 5 contact inquiries, 5 bookings with travelers, and 10 testimonials`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
