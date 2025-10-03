# GitHub Actions CI/CD Pipeline Documentation

This document explains how to set up and use the CI/CD pipeline for deploying VacationPlanner to Vercel.

## Overview

The pipeline includes the following workflows:

- **Test & Lint**: Runs on all pushes and PRs - executes linting, formatting checks, and tests
- **Build**: Builds the Next.js application to verify production build succeeds
- **Deploy Preview**: Deploys preview environments for pull requests
- **Deploy Production**: Deploys to production on pushes to master/main branch
- **Seed Database**: Manual workflow to seed the production database (workflow_dispatch only)

## Required GitHub Secrets

You must configure the following secrets in your GitHub repository settings (Settings > Secrets and variables > Actions):

### Vercel Configuration

1. **VERCEL_TOKEN** (Required)
   - Your Vercel authentication token
   - How to get:
     - Go to https://vercel.com/account/tokens
     - Click "Create Token"
     - Name it "GitHub Actions" (or similar)
     - Copy the token value

2. **VERCEL_ORG_ID** (Required)
   - Your Vercel organization/team ID
   - How to get:
     ```bash
     # Install Vercel CLI locally
     npm i -g vercel

     # Login and link project
     vercel login
     vercel link

     # Find org ID in .vercel/project.json
     cat .vercel/project.json
     ```

3. **VERCEL_PROJECT_ID** (Required)
   - Your Vercel project ID
   - How to get: Same as above - found in `.vercel/project.json`

### Database Configuration

4. **DATABASE_URL** (Required for Preview)
   - PostgreSQL connection string for preview environments
   - Example: `postgresql://user:password@host:5432/database_preview?schema=public`
   - Consider using: Vercel Postgres, Supabase, or Neon for serverless PostgreSQL

5. **DATABASE_URL_PRODUCTION** (Required for Production)
   - PostgreSQL connection string for production
   - Example: `postgresql://user:password@host:5432/database_prod?schema=public`
   - IMPORTANT: Use a production-grade database (not SQLite) for Vercel deployments

### API Keys

6. **ANTHROPIC_API_KEY** (Required)
   - Your Anthropic Claude API key for AI features
   - How to get:
     - Go to https://console.anthropic.com/
     - Navigate to API Keys section
     - Create a new API key
     - Copy the key value

## Setting Up Vercel Project

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (creates .vercel directory)
vercel link

# The command will prompt you to:
# 1. Select your scope (personal or team)
# 2. Link to existing project or create new one
# 3. Confirm the directory

# Copy the values from .vercel/project.json
cat .vercel/project.json
```

### Option 2: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`
5. Get Project ID and Org ID from Project Settings

## Configuring GitHub Environments

For enhanced security and deployment controls, set up GitHub Environments:

### 1. Preview Environment

1. Go to your repo: Settings > Environments > New environment
2. Name it "Preview"
3. Add environment secrets (same as repository secrets)
4. Optional: Add protection rules for preview deployments

### 2. Production Environment

1. Create a new environment named "Production"
2. Add environment secrets (use production values)
3. **Recommended Protection Rules**:
   - Required reviewers: Add team members who must approve production deploys
   - Wait timer: 0 minutes (or add delay if desired)
   - Deployment branches: Only allow `master` and `main` branches

## Database Migration Strategy

### Important: SQLite vs PostgreSQL

Your current setup uses SQLite, which **will not work on Vercel** (serverless environment). You must migrate to PostgreSQL for production.

### Migration Steps

1. **Set up PostgreSQL database** (choose one):
   - Vercel Postgres (integrated): https://vercel.com/docs/storage/vercel-postgres
   - Supabase (free tier): https://supabase.com/
   - Neon (serverless): https://neon.tech/
   - Railway: https://railway.app/

2. **Update Prisma Schema**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Create and Run Migrations**:
   ```bash
   # Create new migration for PostgreSQL
   npx prisma migrate dev --name init_postgres

   # The workflow will automatically run migrations on production deploy
   ```

4. **Set Environment Variables in Vercel**:
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add `DATABASE_URL` for Production, Preview, and Development
   - Add `ANTHROPIC_API_KEY` for all environments

## Workflow Triggers

### Automatic Triggers

- **On Pull Request**:
  - Runs tests and linting
  - Builds application
  - Deploys preview environment
  - Comments PR with preview URL

- **On Push to Master/Main**:
  - Runs tests and linting
  - Builds application
  - Runs database migrations
  - Deploys to production
  - Performs health check

### Manual Triggers

- **Seed Database**:
  ```bash
  # Via GitHub UI: Actions > Seed Database > Run workflow
  # Or via GitHub CLI:
  gh workflow run seed-database.yml
  ```

## Testing the Pipeline

### 1. Test with a Pull Request

```bash
# Create a new branch
git checkout -b test-ci-pipeline

# Make a small change
echo "# Testing CI/CD" >> README.md

# Commit and push
git add .
git commit -m "Test: CI/CD pipeline"
git push origin test-ci-pipeline

# Create PR on GitHub
# Watch the workflow run in Actions tab
```

### 2. Monitor the Workflow

1. Go to your GitHub repo
2. Click the "Actions" tab
3. Watch the workflow progress:
   - Test job should complete first
   - Build job runs after tests pass
   - Deploy Preview job creates preview environment
4. Check the PR for automated comment with preview URL

### 3. Test Production Deploy

```bash
# Merge the PR or push directly to master
git checkout master
git merge test-ci-pipeline
git push origin master

# Watch deployment in Actions tab
# Verify production deployment health check passes
```

## Pipeline Features

### Caching

- Node modules are cached using `cache: 'npm'` in setup-node action
- Speeds up subsequent runs significantly
- Cache is automatically invalidated when package-lock.json changes

### Fail-Fast Strategy

- Tests must pass before build job runs
- Build must succeed before deployment
- Database migrations must succeed before production deploy
- Any failure stops the pipeline immediately

### Artifact Management

- **Coverage Reports**: Retained for 7 days, useful for tracking test coverage trends
- **Build Output**: Retained for 1 day, helpful for debugging build issues
- Artifacts are uploaded even if tests fail (for debugging)

### Security Best Practices

- Secrets are never exposed in logs
- Environment variables are injected at runtime
- Production requires environment protection rules
- OIDC could be added for enhanced security (future improvement)

### Health Checks

- Production deployment includes automated health check
- Verifies the deployment is responding with HTTP 200
- Fails the workflow if deployment is unhealthy
- 10-second delay allows Vercel to warm up the deployment

## Troubleshooting

### Issue: "VERCEL_TOKEN is not set"

**Solution**: Ensure you've added the VERCEL_TOKEN secret in GitHub repository settings.

### Issue: "Project not found"

**Solution**: Verify VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct. Run `vercel link` locally and check `.vercel/project.json`.

### Issue: Database migrations fail

**Solution**:
- Check DATABASE_URL_PRODUCTION is correct
- Ensure the database is accessible from Vercel
- Verify PostgreSQL is being used (not SQLite)
- Check Prisma schema is compatible with PostgreSQL

### Issue: Build fails with Prisma error

**Solution**:
- Run `npx prisma generate` before building
- Ensure DATABASE_URL environment variable is set
- Check Prisma schema syntax is valid

### Issue: Tests fail in CI but pass locally

**Solution**:
- Check environment variables are set in GitHub Secrets
- Review test.db path and DATABASE_URL for tests
- Ensure test database is properly isolated
- Check Node version matches between local and CI (20.x)

### Issue: Preview deployment but no comment on PR

**Solution**:
- Ensure GitHub Actions has write permissions: Settings > Actions > General > Workflow permissions > "Read and write permissions"
- Check the `actions/github-script@v7` step logs for errors

## Environment Variables Reference

### Required in GitHub Secrets

| Secret Name | Used In | Description |
|------------|---------|-------------|
| VERCEL_TOKEN | All deployments | Vercel authentication token |
| VERCEL_ORG_ID | All deployments | Vercel organization ID |
| VERCEL_PROJECT_ID | All deployments | Vercel project ID |
| DATABASE_URL | Preview | PostgreSQL URL for preview |
| DATABASE_URL_PRODUCTION | Production | PostgreSQL URL for production |
| ANTHROPIC_API_KEY | All | Claude API key for AI features |

### Also Configure in Vercel Dashboard

Add these same environment variables in Vercel project settings for runtime:
- `DATABASE_URL` (different values for Preview/Production)
- `ANTHROPIC_API_KEY`

## Next Steps

1. Set up all required GitHub Secrets
2. Configure PostgreSQL database (migrate from SQLite)
3. Update Prisma schema for PostgreSQL
4. Create GitHub Environments with protection rules
5. Test with a pull request
6. Deploy to production
7. Monitor deployment health and performance

## Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

For issues with:
- **GitHub Actions**: Check the Actions tab logs, review workflow YAML syntax
- **Vercel Deployment**: Check Vercel dashboard deployment logs
- **Database Issues**: Review Prisma logs and database connection strings
- **Build Failures**: Check build logs, verify dependencies, ensure environment variables are set
