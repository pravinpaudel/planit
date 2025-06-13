#!/bin/bash
# find-untested-files.sh - Script to identify files without corresponding tests

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Source and test directories
SOURCE_DIR="src"
TEST_DIR="tests"

# Function to check if a test file exists for a source file
function has_test_file() {
  local source_file=$1
  local base_name=$(basename "$source_file" .js)
  local dir_path=$(dirname "$source_file" | sed "s|^${SOURCE_DIR}||")
  
  # Check for unit tests
  if [[ -f "${TEST_DIR}/unit${dir_path}/${base_name}.test.js" ]]; then
    return 0
  fi
  
  # Check for integration tests for controllers and routes
  if [[ "$source_file" == *"controllers"* ]] && [[ -f "${TEST_DIR}/integration/${base_name//Controller/Routes}.test.js" ]]; then
    return 0
  fi
  
  if [[ "$source_file" == *"routes"* ]] && [[ -f "${TEST_DIR}/integration/${base_name}.test.js" ]]; then
    return 0
  fi
  
  return 1
}

echo -e "${YELLOW}Checking for untested files...${NC}"
echo

# Track metrics
total_files=0
tested_files=0
untested_files=0

# Find all JavaScript files in src directory (excluding specific directories)
while IFS= read -r file; do
  total_files=$((total_files + 1))
  
  if has_test_file "$file"; then
    tested_files=$((tested_files + 1))
    echo -e "${GREEN}✓ ${file} has tests${NC}"
  else
    untested_files=$((untested_files + 1))
    echo -e "${RED}✗ ${file} has no tests${NC}"
  fi
done < <(find "${SOURCE_DIR}" -name "*.js" | sort)

# Calculate coverage percentage
coverage=$(( (tested_files * 100) / total_files ))

echo
echo -e "${YELLOW}Test Coverage Summary:${NC}"
echo -e "Total Files: ${total_files}"
echo -e "Tested Files: ${GREEN}${tested_files}${NC}"
echo -e "Untested Files: ${RED}${untested_files}${NC}"
echo -e "Coverage: ${coverage}%"

# Suggest next files to test
if [[ $untested_files -gt 0 ]]; then
  echo
  echo -e "${YELLOW}Suggestions for next files to test:${NC}"
  while IFS= read -r file; do
    if ! has_test_file "$file"; then
      # Get category (service, controller, etc.)
      if [[ "$file" == *"/service/"* ]]; then
        echo -e "${YELLOW}Service: ${file}${NC} - Critical to test business logic"
      elif [[ "$file" == *"/controllers/"* ]]; then
        echo -e "${YELLOW}Controller: ${file}${NC} - Important for API behavior"
      elif [[ "$file" == *"/middleware/"* ]]; then
        echo -e "${YELLOW}Middleware: ${file}${NC} - Important for request processing"
      elif [[ "$file" == *"/utils/"* ]]; then
        echo -e "${YELLOW}Utility: ${file}${NC} - Reused across application"
      else
        echo -e "${YELLOW}Other: ${file}${NC}"
      fi
    fi
  done < <(find "${SOURCE_DIR}" -name "*.js" | grep -v "index.js" | sort)
fi
