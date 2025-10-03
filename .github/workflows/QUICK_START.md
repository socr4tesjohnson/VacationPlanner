# Quick Start Guide - CI/CD Pipeline

This is a condensed guide to get your CI/CD pipeline up and running quickly.

## Prerequisites Checklist

- [ ] GitHub repository created
- [ ] Vercel account created
- [ ] PostgreSQL database ready
- [ ] Anthropic API key obtained

## 5-Minute Setup

### 1. Link Vercel Project (2 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link
vercel login
vercel link

# Note these values from .vercel/project.json
cat .vercel/project.json
# Copy: orgId and projectId
```

### 2. Get Vercel Token (1 minute)

1. Visit: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: "GitHub Actions"
4. Copy the token

### 3. Add GitHub Secrets (2 minutes)

Go to: `GitHub Repo → Settings → Secrets and variables → Actions → New secret`

Add these 6 secrets:

```
VERCEL_TOKEN            = <from step 2>
VERCEL_ORG_ID          = <from .vercel/project.json>
VERCEL_PROJECT_ID      = <from .vercel/project.json>
DATABASE_URL           = postgresql://user:pass@host:5432/db_preview
DATABASE_URL_PRODUCTION = postgresql://user:pass@host:5432/db_prod
ANTHROPIC_API_KEY      = <your Claude API key>
```

### 4. Update Database Provider

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // ← Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Create migration:

```bash
npx prisma migrate dev --name switch_to_postgresql
```

### 5. Configure Vercel Environment Variables

Go to: `Vercel Dashboard → Your Project → Settings → Environment Variables`

Add for **Production**:
- `DATABASE_URL` = your production PostgreSQL URL
- `ANTHROPIC_API_KEY` = your Claude API key

Add for **Preview**:
- `DATABASE_URL` = your preview PostgreSQL URL
- `ANTHROPIC_API_KEY` = your Claude API key

### 6. Test It!

```bash
# Create test branch
git checkout -b test-ci

# Make a small change
echo "Testing CI/CD" >> README.md

# Commit and push
git add .
git commit -m "test: CI/CD pipeline"
git push origin test-ci

# Create PR on GitHub and watch it deploy!
```

## What Happens Next

When you create a PR:
1. Tests run automatically
2. Build is created
3. Preview deployment to Vercel
4. PR gets a comment with preview URL

When you merge to master:
1. Tests run
2. Database migrations execute
3. Production deployment to Vercel
4. Health check verifies deployment

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Vercel token not set" | Add VERCEL_TOKEN to GitHub secrets |
| "Project not found" | Verify VERCEL_ORG_ID and VERCEL_PROJECT_ID |
| Database migration fails | Check DATABASE_URL_PRODUCTION is correct |
| Build fails | Check all environment variables are set |
| No PR comment | Enable write permissions: Settings → Actions → General → Workflow permissions → "Read and write" |

## Database Options

Choose one for production:

- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres (easiest)
- **Supabase**: https://supabase.com/ (free tier available)
- **Neon**: https://neon.tech/ (serverless PostgreSQL)
- **Railway**: https://railway.app/ (developer-friendly)

## Required GitHub Actions Permissions

Go to: `Settings → Actions → General → Workflow permissions`

Set to: **"Read and write permissions"**

Check: **"Allow GitHub Actions to create and approve pull requests"**

## Verify Setup

Run the verification script:

```bash
# On Linux/Mac
chmod +x .github/workflows/verify-setup.sh
./.github/workflows/verify-setup.sh

# On Windows (Git Bash)
bash .github/workflows/verify-setup.sh
```

## Common Commands

```bash
# Check Vercel login
vercel whoami

# Deploy preview manually
vercel

# Deploy production manually
vercel --prod

# Check GitHub secrets (requires gh CLI)
gh secret list

# View workflow runs
gh run list

# Watch latest workflow
gh run watch
```

## Next Steps After Setup

1. ✅ Test with a PR
2. ✅ Verify preview deployment
3. ✅ Test production deployment
4. Set up GitHub Environments with protection rules
5. Configure custom domain in Vercel
6. Add monitoring (Vercel Analytics, Sentry)
7. Set up branch protection rules
8. Configure automated backups

## Documentation

- **Full Documentation**: [README.md](./README.md)
- **Setup Checklist**: [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
- **Workflow File**: [deploy.yml](./deploy.yml)

## Support Resources

- Vercel: https://vercel.com/docs
- GitHub Actions: https://docs.github.com/actions
- Prisma: https://www.prisma.io/docs
- Next.js: https://nextjs.org/docs

## Success Indicators

You're ready when:
- ✅ PR creates preview deployment automatically
- ✅ PR gets comment with preview URL
- ✅ Merge to master deploys to production
- ✅ All tests pass before deployment
- ✅ Production health check succeeds

---

**Time to first successful deployment: ~15 minutes**

Need help? Check the [full documentation](./README.md) or [open an issue](../../issues).
