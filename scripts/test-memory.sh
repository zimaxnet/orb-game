#!/bin/bash

# AIMCS Memory Function Test Script
# Tests all memory endpoints and functionality

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Dependency check
for dep in curl jq; do
  if ! command -v $dep &> /dev/null; then
    echo -e "${RED}❌ Missing dependency: $dep. Please install it first.${NC}"
    exit 1
  fi
done

# Configuration
BACKEND_URL="https://api.aimcs.net"
TEST_USER_ID="memory-test-user-$(date +%s)"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    echo -e "\n${YELLOW}🧪 Testing: $test_name${NC}"
    echo "Command: $test_command"
    
    local output
    output=$(eval "$test_command" 2>&1)
    if echo "$output" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        echo "Expected pattern: $expected_pattern"
        echo -e "Actual output:\n$output"
        ((TESTS_FAILED++))
    fi
}

# Function to test API endpoint
test_endpoint() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="${3:-}"
    local expected_pattern="$4"
    local test_name="$5"
    
    local curl_command="curl -s -X $method $BACKEND_URL$endpoint"
    if [ ! -z "$data" ]; then
        curl_command="$curl_command -H 'Content-Type: application/json' -d '$data'"
    fi
    
    run_test "$test_name" "$curl_command" "$expected_pattern"
}

# Print configuration
print_config() {
  echo -e "${BLUE}📋 Test Configuration:${NC}"
  echo "  Backend URL: $BACKEND_URL"
  echo "  Test User ID: $TEST_USER_ID"
}

print_config

echo -e "\n${BLUE}🚀 Starting Memory Function Tests...${NC}"

# Test 1: Memory Stats Endpoint
test_endpoint "/api/memory/stats" "GET" "" "totalMemories" "Memory Stats Endpoint"

# Test 2: Memory Profile Endpoint
test_endpoint "/api/memory/profile" "GET" "" "name" "Memory Profile Endpoint"

# Test 3: Store Memory via Chat
echo -e "\n${YELLOW}🧪 Testing: Memory Storage via Chat${NC}"
FIRST_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?", "userId": "'$TEST_USER_ID'"}')

if echo "$FIRST_RESPONSE" | grep -q "response"; then
    echo -e "${GREEN}✅ PASS: Memory Storage via Chat${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Memory Storage via Chat${NC}"
    echo "Response: $FIRST_RESPONSE"
    ((TESTS_FAILED++))
fi

# Test 4: Memory Retrieval (same question)
echo -e "\n${YELLOW}🧪 Testing: Memory Retrieval${NC}"
SECOND_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?", "userId": "'$TEST_USER_ID'"}')

if echo "$SECOND_RESPONSE" | grep -q "response"; then
    echo -e "${GREEN}✅ PASS: Memory Retrieval${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Memory Retrieval${NC}"
    echo "Response: $SECOND_RESPONSE"
    ((TESTS_FAILED++))
fi

# Test 5: Memory Search
test_endpoint "/api/memory/search" "POST" '{"query": "capital", "userId": "'$TEST_USER_ID'", "limit": 5}' "memories" "Memory Search Endpoint"

# Test 6: Memory Export
test_endpoint "/api/memory/export" "GET" "" "\[\]" "Memory Export Endpoint"

# Test 7: Test with Web Search
echo -e "\n${YELLOW}🧪 Testing: Memory with Web Search${NC}"
WEB_SEARCH_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the latest news about AI?", "userId": "'$TEST_USER_ID'"}')

if echo "$WEB_SEARCH_RESPONSE" | grep -q "response"; then
    echo -e "${GREEN}✅ PASS: Memory with Web Search${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Memory with Web Search${NC}"
    echo "Response: $WEB_SEARCH_RESPONSE"
    ((TESTS_FAILED++))
fi

# Test 8: Memory Context Injection
echo -e "\n${YELLOW}🧪 Testing: Memory Context Injection${NC}"
CONTEXT_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me more about France", "userId": "'$TEST_USER_ID'"}')

if echo "$CONTEXT_RESPONSE" | grep -q "response"; then
    echo -e "${GREEN}✅ PASS: Memory Context Injection${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Memory Context Injection${NC}"
    echo "Response: $CONTEXT_RESPONSE"
    ((TESTS_FAILED++))
fi

# Test 9: Memory Stats After Usage
echo -e "\n${YELLOW}🧪 Testing: Memory Stats After Usage${NC}"
sleep 2  # Wait for stats to update
FINAL_STATS=$(curl -s $BACKEND_URL/api/memory/stats)
if echo "$FINAL_STATS" | grep -q "totalMemories"; then
    echo -e "${GREEN}✅ PASS: Memory Stats After Usage${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Memory Stats After Usage${NC}"
    echo "Response: $FINAL_STATS"
    ((TESTS_FAILED++))
fi

# Test 10: Error Handling
echo -e "\n${YELLOW}🧪 Testing: Memory Error Handling${NC}"
ERROR_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}')

if echo "$ERROR_RESPONSE" | grep -q "error"; then
    echo -e "${GREEN}✅ PASS: Memory Error Handling${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Memory Error Handling${NC}"
    echo "Response: $ERROR_RESPONSE"
    ((TESTS_FAILED++))
fi

# Performance Test
echo -e "\n${YELLOW}🧪 Testing: Memory Performance${NC}"
START_TIME=$(date +%s.%N)
PERF_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?", "userId": "'$TEST_USER_ID'"}')
END_TIME=$(date +%s.%N)

RESPONSE_TIME=$(echo "$END_TIME - $START_TIME" | bc -l)
if (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    echo -e "${GREEN}✅ PASS: Memory Performance (${RESPONSE_TIME}s)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Memory Performance (${RESPONSE_TIME}s)${NC}"
    ((TESTS_FAILED++))
fi

# Summary
echo -e "\n${BLUE}📊 Test Results Summary:${NC}"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))
echo -e "${BLUE}📈 Success Rate: $SUCCESS_RATE%${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All Memory Tests Passed! Memory system is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️ Some Memory Tests Failed. Please check the implementation.${NC}"
    exit 1
fi 