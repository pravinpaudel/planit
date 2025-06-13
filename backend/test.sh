#!/bin/bash
# test.sh - Script for running different types of tests

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Parse command line arguments
MODE="all"
WATCH=false
COVERAGE=false

# Parse options
for arg in "$@"; do
  case $arg in
    --unit)
      MODE="unit"
      shift
      ;;
    --integration)
      MODE="integration"
      shift
      ;;
    --e2e)
      MODE="e2e"
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

# Function to run tests
run_tests() {
  local test_pattern=$1
  local options=""
  
  if [ "$WATCH" = true ]; then
    options="$options --watch"
  fi
  
  if [ "$COVERAGE" = true ]; then
    options="$options --coverage"
  fi

  echo -e "${YELLOW}Running tests: $test_pattern${NC}"
  NODE_ENV=test npx jest $test_pattern $options
}

# Run tests based on mode
case $MODE in
  "unit")
    run_tests "tests/unit"
    ;;
  "integration")
    run_tests "tests/integration"
    ;;
  "e2e")
    run_tests "tests/e2e"
    ;;
  "all")
    run_tests "tests/"
    ;;
esac
