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
This is **NOT** a booking platform. It's a lead capture and information gathering tool that:
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

## Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM (development), PostgreSQL (production via Neon)
- **AI**: Anthropic Claude API for vacation recommendations
- **Hosting**: Vercel
- **Email**: Resend (planned, not yet configured)

### Key Directories
```
VacationPlanner/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # React components
│   └── lib/              # Utilities (AI, DB, etc.)
├── prisma/               # Database schema and migrations
├── RDP/                  # Requirements & Design Documents
└── public/               # Static assets
```

### Important Files
- `src/lib/ai-agent.ts` - AI recommendation logic
- `src/app/api/contact/route.ts` - Contact form handler
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables (API keys)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Database commands
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Run migrations
npx prisma db push         # Push schema to database
npx prisma studio          # Open database GUI

# Build for production
npm run build

# Run tests
npm test

# Linting
npm run lint
```

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

## Current Project Status

### ✅ Completed
- Next.js project setup with TypeScript and Tailwind
- Database schema and Prisma ORM
- Homepage with hero and featured packages
- Vacation listing page with filtering
- Package detail pages
- Contact form with validation
- AI recommendations feature (UI complete, model needs fixing)

### ⚠️ In Progress / Needs Work
- AI model configuration (404 error with current model)
- AI strategy update (should fetch Disney website data, not just recommend existing packages)
- Email notifications via Resend
- Mobile responsiveness refinements
- Content updates to reflect Laura's personal brand

### 📋 Planned
- Production deployment optimization
- Real vacation package content (replace sample data)
- Client testimonials
- About Laura page
- SEO optimization
- Analytics integration
