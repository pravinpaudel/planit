#!/bin/bash
# setup-test-db.sh - Utility script to set up a test database for E2E testing

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Default values
DB_URL=""
DB_NAME="planit_test"

# Parse options
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --db-url) DB_URL="$2"; shift ;;
    --db-name) DB_NAME="$2"; shift ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

# Ensure we have necessary utilities
command -v npx >/dev/null 2>&1 || { 
  echo -e "${RED}Error: npx is not installed. Please install Node.js.${NC}" >&2
  exit 1
}

# Create .env.test file if it doesn't exist
if [ ! -f .env.test ]; then
  echo -e "${YELLOW}Creating .env.test file${NC}"
  cat > .env.test << EOL
DATABASE_URL="postgresql://postgres:threads@localhost:5432/${DB_NAME}?schema=public"
JWT_SECRET="test-secret-key-for-e2e-tests"
NODE_ENV="test"
EOL
  echo -e "${GREEN}.env.test file created${NC}"
else
  echo -e "${YELLOW}.env.test file already exists${NC}"
fi

# Check if custom DB_URL was provided
if [ -n "$DB_URL" ]; then
  echo -e "${YELLOW}Using custom database URL: $DB_URL${NC}"
  sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|g" .env.test
fi

# Use the test environment
echo -e "${YELLOW}Setting up test database...${NC}"
export NODE_ENV=test

# Apply migrations to test database
echo -e "${YELLOW}Applying migrations to test database...${NC}"
npx prisma migrate deploy --preview-feature

# Generate Prisma client if needed
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}Test database setup complete!${NC}"
echo -e "${YELLOW}You can now run E2E tests with: npm run test:e2e${NC}"
