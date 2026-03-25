# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Laura Coleman's Vacation Planner** - A personalized lead generation and client intake platform for Laura Coleman's travel advisory business under Whitney World Travel.

### Business Owner

- **Name**: Laura Coleman
- **Affiliation**: Travel Advisor at Whitney World Travel
- **Location**: Fayetteville, AR
- **Specializations**: Disney Destinations, Universal Parks & Experiences, Cruise Vacations
- **Facebook**: [facebook.com/profile.php?id=61558329989600](https://facebook.com/profile.php?id=61558329989600)

### Platform Purpose

This is **NOT** a booking platform. It is a lead capture and information gathering tool that:

1. Showcases vacation possibilities (Disney, Universal, cruises)
2. Gathers client preferences through detailed forms
3. Facilitates Laura's personalized consultation process
4. Uses AI to generate initial recommendations
5. Enables Laura to follow up with customized trip planning

### Brand Values (Whitney World Travel)

- Integrity
- Family
- Fun
- Collaborative
- Passionate

---

## Architecture

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS 3.4 |
| Forms & Validation | React Hook Form 7, Zod 4 |
| Backend | Next.js API Routes |
| Database | SQLite (development), PostgreSQL via Neon (production) |
| ORM | Prisma 6 |
| AI | Anthropic Claude API (`claude-3-5-sonnet-20241022`) |
| Auth | Custom session-based (bcrypt + UUID tokens) |
| Hosting | Vercel |
| Email | Resend (planned, not yet configured) |
| Icons | Lucide React |
| Testing | Jest 30, React Testing Library 16 |

### Directory Structure

```
VacationPlanner/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── admin/                # Protected admin endpoints
│   │   │   │   ├── bookings/         # Booking CRUD
│   │   │   │   ├── inquiries/        # Inquiry management
│   │   │   │   ├── packages/         # Package CRUD + AI generation
│   │   │   │   ├── testimonials/     # Testimonial approval workflow
│   │   │   │   └── login/            # Admin login
│   │   │   ├── auth/                 # Session auth routes
│   │   │   │   ├── login/            # POST: email/password login
│   │   │   │   ├── logout/           # POST: clear session
│   │   │   │   ├── me/               # GET: current user
│   │   │   │   └── session/          # GET: validate session
│   │   │   ├── contact/              # POST: public contact form submission
│   │   │   ├── packages/[id]/        # GET: single package details
│   │   │   └── testimonials/         # GET: approved public testimonials
│   │   ├── admin/                    # Protected admin pages
│   │   │   ├── dashboard/
│   │   │   ├── inquiries/
│   │   │   ├── packages/new/
│   │   │   └── testimonials/
│   │   ├── contact/                  # Public contact page
│   │   ├── login/                    # Admin login page
│   │   ├── packages/[slug]/          # Package detail page
│   │   ├── recommendations/          # AI recommendations page
│   │   ├── testimonials/             # Public testimonials page
│   │   ├── vacations/                # Package listing with filters
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Homepage
│   ├── components/
│   │   ├── auth/                     # ProtectedRoute wrapper
│   │   ├── forms/                    # RecommendationResults
│   │   ├── layout/                   # Header, Footer
│   │   ├── packages/                 # PackageCard
│   │   ├── providers/                # Client-side context providers
│   │   ├── testimonials/             # TestimonialCard
│   │   └── ui/                       # Button, StarRating
│   ├── contexts/
│   │   └── AuthContext.tsx           # Client-side auth state
│   ├── lib/
│   │   ├── ai-agent.ts              # Claude AI recommendations
│   │   ├── auth.ts                  # bcrypt, tokens, cookies
│   │   ├── booking-helpers.ts       # Confirmation numbers, calculations
│   │   ├── db.ts                    # Prisma client singleton
│   │   ├── middleware.ts            # Route auth middleware
│   │   └── utils.ts                 # General utilities
│   └── middleware.ts                # Next.js edge middleware
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.ts                      # Seed script (test users + packages)
├── __tests__/                       # Jest test files
│   ├── api/auth/                    # Auth route tests
│   ├── components/                  # Component tests
│   ├── lib/                         # Library unit tests
│   └── utils/                       # Test helpers (mocks, factories)
├── public/
│   └── uploads/packages/            # Uploaded package images
├── jest.config.js
├── jest.setup.js
├── next.config.js
├── tailwind.config.ts
└── package.json
```

### Key Files

| File | Purpose |
|---|---|
| `src/lib/ai-agent.ts` | AI recommendation logic (fetches packages, calls Claude) |
| `src/lib/auth.ts` | Password hashing, session tokens, cookies |
| `src/lib/middleware.ts` | `requireAuth`, `requireRole`, `withMiddleware` helpers |
| `src/lib/booking-helpers.ts` | VPL-YYYY-XXXXXX confirmation numbers, Decimal math |
| `src/lib/db.ts` | Prisma singleton (prevents hot-reload re-instantiation) |
| `src/app/api/contact/route.ts` | Contact form handler + AI recommendation trigger |
| `prisma/schema.prisma` | Full database schema |
| `prisma/seed.ts` | Creates 3 test users and sample packages |

---

## Database Schema

### Models

**User** — Admin/agent accounts
- Roles: `ADMIN`, `MANAGER`, `AGENT`
- Relations: `Session[]`, `Booking[]`

**Session** — Auth tokens (7-day expiry, UUID-based)

**VacationPackage** — Core content entity
- Types: `disney-park`, `disney-cruise`, `cruise`, `combo`
- Fields: `slug` (unique), `startingPrice`, `pricePerPerson`, `deposit`, `nights`, `days`, `inclusions`, `exclusions`, `tags` (JSON strings), `featured`, `active`, `priority`
- Relations: `Image[]`, `Itinerary[]`, `ContactInquiry[]`, `Booking[]`, `Testimonial[]`

**Image** — Package images with `isPrimary`, `order`, dimensions

**Itinerary** — Day-by-day breakdown per package

**Customer** — Deduplicated client records linked to inquiries and bookings

**ContactInquiry** — Lead capture (the primary business object)
- Tracks: dates, flexibility, party size, child ages, budget range, source
- Financial: `quotedAmount`, `commissionRate`, `commissionAmount` (Decimal)
- Status flow: `new → contacted → converted` (and others)
- Indexes on: `status`, `email`, `createdAt`, `customerId`

**Booking** — Confirmed reservations
- Auto-generated confirmation number: `VPL-YYYY-XXXXXX`
- Status: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`
- Tracks deposit paid, balance due (Decimal for accuracy)
- Relations: `BookingTraveler[]`

**BookingTraveler** — Individual travelers per booking (cascade delete)

**Testimonial** — Customer reviews
- Two-step approval: `approved` + `active` flags
- Composite index on `(approved, active, featured)`

---

## API Conventions

### Middleware Pattern

All protected routes use the `withMiddleware` pattern from `src/lib/middleware.ts`:

```typescript
export const GET = withMiddleware(handler, requireAuth());
export const POST = withMiddleware(handler, requireRole('ADMIN', 'MANAGER'));
```

Available middleware:
- `requireAuth()` — any authenticated user
- `requireRole(...roles)` — specific roles
- `requireAdmin()` — ADMIN only
- `requireManager()` — MANAGER or ADMIN

### Response Format

Use helpers from `src/lib/middleware.ts`:

```typescript
// Success
return createSuccessResponse(data, 200);

// Error
return createErrorResponse('Not found', 404, 'NOT_FOUND');
```

Error responses include `{ error: string, code: string }`.

### Authentication

- Tokens stored as HttpOnly, Secure, SameSite=Strict cookies
- Also accepted via `Authorization: Bearer <token>` header
- Extract with `extractSessionToken(request)` from `src/lib/auth.ts`
- Never return `password` field — use `sanitizeUser(user)`

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Database
npx prisma generate        # Regenerate Prisma client after schema changes
npx prisma migrate dev     # Create and apply a new migration
npx prisma db push         # Push schema without migration (quick dev use)
npx prisma studio          # Open database browser GUI
npm run db:seed            # Seed test users and sample packages

# Build & lint
npm run build              # Production build
npm run lint               # ESLint
npm run format             # Prettier

# Testing
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
npm run test:ci            # CI mode (no watch)
```

### Seed Accounts

After running `npm run db:seed`:

| Email | Password | Role |
|---|---|---|
| admin@vacationplanner.com | admin123 | ADMIN |
| agent@vacationplanner.com | agent123 | AGENT |
| manager@vacationplanner.com | manager123 | MANAGER |

---

## Environment Variables

```
DATABASE_URL="postgresql://..."   # Neon PostgreSQL (production) or file:./dev.db (dev)
ANTHROPIC_API_KEY="sk-ant-..."    # Required for AI recommendations
NEXT_PUBLIC_APP_URL="..."         # Public URL for absolute links
RESEND_API_KEY="..."              # Email (optional, not yet implemented)
```

---

## Testing

- **Framework**: Jest 30 + React Testing Library 16
- **Environment**: jsdom
- **Module aliases**: `@/*` maps to `src/*`
- **Coverage thresholds**: 4% (minimal, increase as coverage grows)
- **Test utilities**: `__tests__/utils/prisma-mock.ts`, `__tests__/utils/test-data-factory.ts`
- API route tests are skipped in CI (`testPathIgnorePatterns`)

When writing tests:
- Mock Prisma with `__tests__/utils/prisma-mock.ts`
- Use `test-data-factory.ts` to generate consistent test fixtures
- Component tests use `@testing-library/user-event` for interactions

---

## AI Integration

`src/lib/ai-agent.ts` implements `generateRecommendations(inquiryData)`:

1. Fetches all active `VacationPackage` records from the database
2. Sends customer preferences + package catalog to `claude-3-5-sonnet-20241022`
3. Returns top 3 matches with `score` (0–100), `reasoning`, `highlights`
4. Triggered automatically on contact form submission (`/api/contact`)

**Current model**: `claude-3-5-sonnet-20241022` — working correctly.

---

## Brand & Content Guidelines

### Voice & Tone

- **Personal & Approachable**: Like a knowledgeable friend
- **Professional**: Whitney World Travel credibility
- **Enthusiastic**: Genuine excitement about travel
- **Reassuring**: "I've got this" confidence

### Content Principles

- Lead with Laura's personal brand
- Emphasize expert service over DIY booking
- Focus on stress-free planning and customization
- Use first-person where appropriate ("I specialize in...")
- Clear CTAs encouraging contact

### Design Principles

- Family-friendly, warm aesthetic
- Mobile-first (busy parents on phones)
- High-quality vacation imagery
- Clear expectations for next steps
- Highlight Whitney World Travel affiliation as trust signal

---

## Current Project Status

### Completed

- Next.js 14 setup with TypeScript and Tailwind
- Full database schema and Prisma ORM
- Homepage with hero section and featured packages
- Vacation package listing with category filtering
- Package detail pages with images and itinerary
- Contact form with validation and AI-triggered recommendations
- AI recommendation feature (UI + API, fully functional)
- Admin dashboard framework with protected routes
- Session-based authentication (3 roles: ADMIN, MANAGER, AGENT)
- Booking management API (full CRUD)
- Testimonial approval workflow (admin-managed)
- Contact inquiry tracking with commission fields
- Package creation interface (admin)
- Mobile-responsive design
- Header/Footer with auth-aware navigation
- CI/CD pipeline via GitHub Actions + Vercel

### In Progress / Needs Work

- Email notifications via Resend (TODO in `src/app/api/contact/route.ts`)
- Admin testimonial management UI (API complete, UI incomplete)
- Admin inquiry detail view
- Package image management UI

### Planned

- Real vacation package content (replace sample data)
- About Laura page
- SEO optimization
- Analytics integration
- Advanced filtering on vacations page
