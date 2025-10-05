# CI/CD Setup Checklist

Use this checklist to ensure your CI/CD pipeline is properly configured.

## Prerequisites

- [ ] GitHub repository created and code pushed
- [ ] Vercel account created (https://vercel.com)
- [ ] PostgreSQL database provisioned (Vercel Postgres, Supabase, Neon, or similar)
- [ ] Anthropic API key obtained (https://console.anthropic.com/)

## Step 1: Vercel Project Setup

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Note your Vercel Org ID from `.vercel/project.json`
- [ ] Note your Vercel Project ID from `.vercel/project.json`
- [ ] Create Vercel API token at https://vercel.com/account/tokens

## Step 2: Database Configuration

- [ ] PostgreSQL database created (NOT SQLite for production)
- [ ] Database URL for Preview environment obtained
- [ ] Database URL for Production environment obtained
- [ ] Connection strings tested locally
- [ ] Update `prisma/schema.prisma` to use PostgreSQL:
  ```prisma
  datasource db {
    provider = "postgresql"  // Change from "sqlite"
    url      = env("DATABASE_URL")
  }
  ```
- [ ] Create initial migration: `npx prisma migrate dev --name init_postgres`

## Step 3: GitHub Secrets Configuration

Navigate to: GitHub Repo > Settings > Secrets and variables > Actions > New repository secret

Add the following secrets:

- [ ] `VERCEL_TOKEN` - Your Vercel API token
- [ ] `VERCEL_ORG_ID` - From .vercel/project.json
- [ ] `VERCEL_PROJECT_ID` - From .vercel/project.json
- [ ] `DATABASE_URL` - PostgreSQL connection string (Preview)
- [ ] `DATABASE_URL_PRODUCTION` - PostgreSQL connection string (Production)
- [ ] `ANTHROPIC_API_KEY` - Your Claude API key

## Step 4: Vercel Environment Variables

Navigate to: Vercel Dashboard > Your Project > Settings > Environment Variables

Add for Production:

- [ ] `DATABASE_URL` - Production PostgreSQL URL
- [ ] `ANTHROPIC_API_KEY` - Your Claude API key

Add for Preview:

- [ ] `DATABASE_URL` - Preview PostgreSQL URL
- [ ] `ANTHROPIC_API_KEY` - Your Claude API key (same as production)

Add for Development (optional):

- [ ] `DATABASE_URL` - Local development database
- [ ] `ANTHROPIC_API_KEY` - Your Claude API key

## Step 5: GitHub Environments (Recommended)

Navigate to: GitHub Repo > Settings > Environments

Create "Preview" environment:

- [ ] Environment created
- [ ] Secrets added (if using environment-specific secrets)
- [ ] Protection rules configured (optional)

Create "Production" environment:

- [ ] Environment created
- [ ] Secrets added (if using environment-specific secrets)
- [ ] Required reviewers added (recommended)
- [ ] Deployment branches: Only master/main

## Step 6: GitHub Actions Permissions

Navigate to: GitHub Repo > Settings > Actions > General > Workflow permissions

- [ ] Set to "Read and write permissions" (required for PR comments)
- [ ] Check "Allow GitHub Actions to create and approve pull requests"

## Step 7: Test the Pipeline

- [ ] Create a test branch: `git checkout -b test-pipeline`
- [ ] Make a small change and push
- [ ] Create a Pull Request
- [ ] Verify GitHub Actions workflow runs
- [ ] Check that all jobs complete successfully:
  - [ ] Test job passes
  - [ ] Build job passes
  - [ ] Deploy Preview job completes
- [ ] Verify PR comment with preview URL appears
- [ ] Click preview URL and verify deployment works
- [ ] Merge PR or push to master
- [ ] Verify production deployment runs
- [ ] Check production deployment health check passes
- [ ] Visit production URL and verify it works

## Step 8: Post-Deployment Verification

- [ ] Production site is accessible
- [ ] Database connection works (check API routes)
- [ ] Anthropic AI features work
- [ ] No errors in Vercel deployment logs
- [ ] GitHub Actions workflows all green
- [ ] Coverage reports uploaded (in Actions artifacts)

## Optional Enhancements

- [ ] Set up deployment notifications (Slack, Discord, email)
- [ ] Configure custom domain in Vercel
- [ ] Add SSL certificate (automatic with Vercel)
- [ ] Set up monitoring (Vercel Analytics, Sentry, etc.)
- [ ] Configure branch protection rules
- [ ] Add status checks required for merging
- [ ] Set up automated dependency updates (Dependabot)
- [ ] Add performance monitoring
- [ ] Configure CDN and caching rules

## Troubleshooting

If something doesn't work, check:

- [ ] All secrets are spelled correctly (case-sensitive)
- [ ] Database URLs include proper schema: `?schema=public` for PostgreSQL
- [ ] Vercel project is properly linked
- [ ] GitHub Actions has write permissions
- [ ] Environment variables are set in both GitHub and Vercel
- [ ] Prisma schema uses PostgreSQL provider
- [ ] Network access is allowed from Vercel to your database

## Quick Verification Commands

Run these locally to verify your setup:

```bash
# Verify Vercel CLI is installed and logged in
vercel --version
vercel whoami

# Verify project is linked
cat .vercel/project.json

# Test database connection
DATABASE_URL="your-postgres-url" npx prisma db push

# Test build locally
npm run build

# Test deployment to preview
vercel --prod=false

# Check GitHub CLI (optional)
gh auth status
gh secret list
```

## Success Criteria

Your CI/CD pipeline is fully operational when:

1. Pull requests trigger preview deployments automatically
2. Preview URLs are commented on PRs
3. Merging to master triggers production deployment
4. Database migrations run automatically on production deploy
5. Health checks pass for production deployments
6. All tests pass before any deployment
7. Build artifacts and coverage reports are uploaded

## Next Steps After Setup

1. Configure monitoring and alerting
2. Set up error tracking (Sentry recommended)
3. Enable Vercel Analytics for performance insights
4. Configure branch protection to require status checks
5. Document deployment procedures for your team
6. Set up staging environment (if needed)
7. Configure automated backups for production database
8. Review and optimize build times
9. Set up custom domain
10. Configure CDN and caching strategy

## Resources

- [Full Documentation](./.github/workflows/README.md)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
