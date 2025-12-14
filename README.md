# Laura Coleman's Vacation Planner

🌴 **[Visit the Live Site](https://vacation-planner.vercel.app)** 🌴

A personalized lead generation and client intake platform for Laura Coleman's travel advisory business under Whitney World Travel.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/socr4tesjohnson/VacationPlanner)

---

## About

Laura Coleman's Vacation Planner is a modern web application designed to showcase vacation possibilities and gather client preferences for personalized trip planning. This is **not** a booking platform—it's a lead capture and information gathering tool that helps Laura provide expert, customized travel advisory services.

### Business Owner

- **Name**: Laura Coleman
- **Affiliation**: Travel Advisor at Whitney World Travel
- **Location**: Fayetteville, AR
- **Specializations**: Disney Destinations, Universal Parks & Experiences, Cruise Vacations
- **Facebook**: [Laura Coleman Travel](https://facebook.com/profile.php?id=61558329989600)

### Platform Purpose

1. Showcase vacation possibilities (Disney, Universal, cruises)
2. Gather client preferences through detailed forms
3. Facilitate personalized consultation process
4. Use AI to generate initial recommendations
5. Enable Laura to follow up with customized trip planning

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Neon) with Prisma ORM
- **AI**: Anthropic Claude API for vacation recommendations
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- PostgreSQL database (for production) or SQLite (for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/socr4tesjohnson/VacationPlanner.git
cd VacationPlanner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database URL

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="your-database-connection-string"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

---

## Development Commands

```bash
# Development
npm run dev              # Start development server on port 3000

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma db push       # Push schema to database
npx prisma studio        # Open database GUI

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Build
npm run build            # Build for production
npm start                # Start production server
```

---

## Project Structure

```
VacationPlanner/
├── src/
│   ├── app/              # Next.js pages and API routes
│   │   ├── api/          # API endpoints
│   │   ├── admin/        # Admin dashboard
│   │   └── ...           # Public pages
│   ├── components/       # React components
│   └── lib/              # Utilities (AI, DB, etc.)
├── prisma/               # Database schema and migrations
├── __tests__/            # Test files
├── public/               # Static assets
└── .github/              # GitHub Actions workflows
```

---

## Features

### Current Features ✅

- **Homepage**: Hero section with featured vacation packages
- **Vacation Listings**: Browse packages with filtering options
- **Package Details**: Detailed information for each vacation option
- **Contact Forms**: Validated forms for client inquiries
- **AI Recommendations**: Claude-powered vacation suggestions
- **Admin Dashboard**: Client tracking and inquiry management
- **Quote & Commission Tracking**: Monitor inquiries and financials
- **Client Checklists**: Track consultation items
- **Responsive Design**: Mobile-first, family-friendly interface

### Planned Features 📋

- Email notifications via Resend
- Client testimonials section
- About Laura page
- SEO optimization
- Analytics integration
- Real vacation package content

---

## Brand Values (Whitney World Travel)

- **Integrity**: Honest, reliable service
- **Family**: Family-friendly travel experiences
- **Fun**: Enjoyable planning process
- **Collaborative**: Working together with clients
- **Passionate**: Genuine excitement about travel

---

## Deployment

The application is automatically deployed to Vercel via GitHub Actions:

- **Production**: Deploys on push to `main` or `master` branch
- **Preview**: Deploys on pull requests
- **Manual**: Can be triggered via GitHub Actions workflow

For detailed deployment instructions, see [.github/workflows/README.md](.github/workflows/README.md).

---

## Contributing

This is a private project for Laura Coleman's business. For questions or suggestions, please contact the repository owner.

---

## License

Private and proprietary. All rights reserved.

---

## Support

For technical issues or questions about this codebase, see [CLAUDE.md](CLAUDE.md) for development guidelines.

---

**Built with ❤️ for Laura Coleman Travel**
