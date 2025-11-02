#!/bin/bash

# Test script for Currency Exchange API
echo "🧪 Testing Currency Exchange API"
echo "=================================="
echo ""

# Base URL
BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo "Endpoint: ${endpoint}"
    
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ Success (HTTP ${http_code})${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Failed (HTTP ${http_code})${NC}"
        echo "$body"
    fi
    
    echo ""
    echo "---"
    echo ""
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "${BASE_URL}/health" > /dev/null 2>&1; then
    echo -e "${RED}Error: Server is not running on ${BASE_URL}${NC}"
    echo "Please start the server with: npm start"
    exit 1
fi

echo -e "${GREEN}Server is running!${NC}"
echo ""
echo "---"
echo ""

# Run tests
test_endpoint "/health" "Health Check"
test_endpoint "/" "Root Endpoint"
test_endpoint "/quotes" "Get Quotes"
test_endpoint "/average" "Get Average"
test_endpoint "/slippage" "Get Slippage"
test_endpoint "/historical?limit=5" "Get Historical Data (5 records)"
test_endpoint "/quotes?refresh=true" "Get Quotes (Force Refresh)"

echo "=================================="
echo "✅ All tests completed!"
echo ""
echo "Tip: Install jq for better JSON formatting:"
echo "  sudo apt install jq  # Ubuntu/Debian"
echo "  brew install jq      # macOS"
