#!/bin/bash

# CI/CD Setup Verification Script
# This script helps verify your GitHub Actions and Vercel configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  CI/CD Setup Verification Script"
echo "=========================================="
echo ""

# Function to check command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        return 1
    fi
}

# Check required commands
echo "Checking required tools..."
echo "---"
check_command node || echo -e "${YELLOW}→${NC} Install Node.js: https://nodejs.org/"
check_command npm || echo -e "${YELLOW}→${NC} Install npm (comes with Node.js)"
check_command git || echo -e "${YELLOW}→${NC} Install git: https://git-scm.com/"
check_command vercel || echo -e "${YELLOW}→${NC} Install Vercel CLI: npm i -g vercel"
check_command gh || echo -e "${YELLOW}→${NC} Install GitHub CLI (optional): https://cli.github.com/"
echo ""

# Check Node version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} Node.js version is $NODE_VERSION (>= 18 required)"
    else
        echo -e "${RED}✗${NC} Node.js version is $NODE_VERSION (< 18)"
        echo -e "${YELLOW}→${NC} Update to Node.js 18 or higher"
    fi
    echo ""
fi

# Check required files
echo "Checking project files..."
echo "---"
check_file "package.json"
check_file "next.config.js"
check_file "prisma/schema.prisma"
check_file ".github/workflows/deploy.yml"
check_file ".gitignore"
echo ""

# Check Vercel project link
echo "Checking Vercel configuration..."
echo "---"
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✓${NC} Vercel project is linked"

    ORG_ID=$(jq -r '.orgId' .vercel/project.json 2>/dev/null || echo "")
    PROJECT_ID=$(jq -r '.projectId' .vercel/project.json 2>/dev/null || echo "")

    if [ -n "$ORG_ID" ]; then
        echo -e "${GREEN}✓${NC} Vercel Org ID: $ORG_ID"
    fi

    if [ -n "$PROJECT_ID" ]; then
        echo -e "${GREEN}✓${NC} Vercel Project ID: $PROJECT_ID"
    fi
else
    echo -e "${RED}✗${NC} Vercel project not linked"
    echo -e "${YELLOW}→${NC} Run: vercel link"
fi
echo ""

# Check Prisma schema for PostgreSQL
echo "Checking Prisma configuration..."
echo "---"
if [ -f "prisma/schema.prisma" ]; then
    if grep -q 'provider.*=.*"postgresql"' prisma/schema.prisma; then
        echo -e "${GREEN}✓${NC} Prisma is configured for PostgreSQL"
    elif grep -q 'provider.*=.*"sqlite"' prisma/schema.prisma; then
        echo -e "${YELLOW}⚠${NC} Prisma is using SQLite (not recommended for Vercel)"
        echo -e "${YELLOW}→${NC} Update to PostgreSQL for production deployment"
    else
        echo -e "${YELLOW}⚠${NC} Prisma provider not recognized"
    fi
fi
echo ""

# Check package.json scripts
echo "Checking package.json scripts..."
echo "---"
if [ -f "package.json" ]; then
    SCRIPTS=("dev" "build" "start" "lint" "test" "test:ci")
    for script in "${SCRIPTS[@]}"; do
        if jq -e ".scripts.\"$script\"" package.json > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Script '$script' exists"
        else
            echo -e "${YELLOW}⚠${NC} Script '$script' not found (may not be critical)"
        fi
    done
fi
echo ""

# Check environment variables
echo "Checking local environment variables..."
echo "---"
ENV_VARS=("DATABASE_URL" "ANTHROPIC_API_KEY")
for var in "${ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo -e "${GREEN}✓${NC} $var is set"
    else
        echo -e "${YELLOW}⚠${NC} $var is not set in current shell"
    fi
done
echo ""

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    for var in "${ENV_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            echo -e "${GREEN}✓${NC} $var defined in .env"
        else
            echo -e "${YELLOW}⚠${NC} $var not found in .env"
        fi
    done
elif [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local file exists"
    for var in "${ENV_VARS[@]}"; do
        if grep -q "^$var=" .env.local; then
            echo -e "${GREEN}✓${NC} $var defined in .env.local"
        else
            echo -e "${YELLOW}⚠${NC} $var not found in .env.local"
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} No .env or .env.local file found"
    echo -e "${YELLOW}→${NC} Create .env.local with DATABASE_URL and ANTHROPIC_API_KEY"
fi
echo ""

# Check GitHub secrets (requires gh CLI)
if command -v gh &> /dev/null; then
    echo "Checking GitHub secrets..."
    echo "---"

    if gh auth status > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} GitHub CLI is authenticated"

        REQUIRED_SECRETS=("VERCEL_TOKEN" "VERCEL_ORG_ID" "VERCEL_PROJECT_ID" "DATABASE_URL" "DATABASE_URL_PRODUCTION" "ANTHROPIC_API_KEY")

        for secret in "${REQUIRED_SECRETS[@]}"; do
            if gh secret list | grep -q "$secret"; then
                echo -e "${GREEN}✓${NC} GitHub secret '$secret' is set"
            else
                echo -e "${RED}✗${NC} GitHub secret '$secret' is missing"
                echo -e "${YELLOW}→${NC} Add it: gh secret set $secret"
            fi
        done
    else
        echo -e "${YELLOW}⚠${NC} GitHub CLI not authenticated"
        echo -e "${YELLOW}→${NC} Run: gh auth login"
    fi
    echo ""
fi

# Check git remote
echo "Checking Git configuration..."
echo "---"
if git remote -v | grep -q "github.com"; then
    REPO_URL=$(git remote get-url origin | head -n1)
    echo -e "${GREEN}✓${NC} Git remote configured: $REPO_URL"

    # Extract repo info
    if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
        REPO_OWNER="${BASH_REMATCH[1]}"
        REPO_NAME="${BASH_REMATCH[2]}"
        echo -e "${GREEN}✓${NC} Repository: $REPO_OWNER/$REPO_NAME"
    fi
else
    echo -e "${RED}✗${NC} No GitHub remote configured"
    echo -e "${YELLOW}→${NC} Add remote: git remote add origin <github-repo-url>"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo -e "${GREEN}✓${NC} Current branch: $CURRENT_BRANCH"
echo ""

# Summary
echo "=========================================="
echo "  Summary & Next Steps"
echo "=========================================="
echo ""

echo "Required GitHub Secrets:"
echo "  1. VERCEL_TOKEN"
echo "  2. VERCEL_ORG_ID"
echo "  3. VERCEL_PROJECT_ID"
echo "  4. DATABASE_URL (for preview)"
echo "  5. DATABASE_URL_PRODUCTION (for production)"
echo "  6. ANTHROPIC_API_KEY"
echo ""

echo "To add GitHub secrets:"
echo "  gh secret set SECRET_NAME"
echo "  Or: GitHub Repo > Settings > Secrets and variables > Actions"
echo ""

echo "To test the pipeline:"
echo "  1. git checkout -b test-pipeline"
echo "  2. Make a change and commit"
echo "  3. git push origin test-pipeline"
echo "  4. Create a Pull Request"
echo "  5. Watch GitHub Actions run"
echo ""

echo "Documentation:"
echo "  - Full guide: .github/workflows/README.md"
echo "  - Checklist: .github/workflows/SETUP_CHECKLIST.md"
echo ""

echo "For help, visit:"
echo "  - https://vercel.com/docs"
echo "  - https://docs.github.com/actions"
echo ""
