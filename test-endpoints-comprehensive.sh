#!/bin/bash

# Comprehensive ComplianceHub API Endpoint Test
echo -e "\n\033[36m╔════════════════════════════════════════════╗\033[0m"
echo -e "\033[36m║   ComplianceHub API Endpoint Test Suite    ║\033[0m"
echo -e "\033[36m╚════════════════════════════════════════════╝\033[0m\n"

# Initialize counters
total_tests=0
passed_tests=0
failed_tests=0

# Colors
GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    local data=$5
    
    total_tests=$((total_tests + 1))
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "http://localhost:3000$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "http://localhost:3000$endpoint")
    fi
    
    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓${RESET} [$method] $endpoint - $description (Status: $status)"
        passed_tests=$((passed_tests + 1))
    else
        echo -e "${RED}✗${RESET} [$method] $endpoint - $description (Expected: $expected_status, Got: $status)"
        failed_tests=$((failed_tests + 1))
        if [ -n "$body" ]; then
            echo -e "  ${YELLOW}Response:${RESET} $(echo $body | head -c 100)..."
        fi
    fi
}

# Wait for server
echo -e "${YELLOW}⏳ Checking if server is running...${RESET}\n"
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000/api/v1 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server is responding${RESET}\n"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -lt $max_attempts ]; then
        echo -n "."
        sleep 1
    else
        echo -e "\n${RED}✗ Server is not responding${RESET}"
        echo "Make sure the server is started with: npm run start:prod"
        exit 1
    fi
done

# Test Health/General Endpoints
echo -e "${BLUE}📋 Health & General Endpoints${RESET}"
test_endpoint "GET" "/api/v1" "Health Check" "200"
echo ""

# Test Auth Endpoints
echo -e "${BLUE}🔐 Authentication Endpoints${RESET}"
test_endpoint "POST" "/api/v1/auth/register" "Register User" "400" '{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe"}'
test_endpoint "POST" "/api/v1/auth/login" "Login" "401" '{"email":"test@example.com","password":"Test123!"}'
test_endpoint "POST" "/api/v1/auth/refresh" "Refresh Token" "403"
test_endpoint "POST" "/api/v1/auth/logout" "Logout" "403"
echo ""

# Test User Endpoints (require auth)
echo -e "${BLUE}👥 User Endpoints${RESET}"
test_endpoint "GET" "/api/v1/users" "Get All Users" "403"
test_endpoint "GET" "/api/v1/users/me" "Get Current User" "403"
test_endpoint "GET" "/api/v1/users/1" "Get User by ID" "403"
echo ""

# Test Company Endpoints (require auth)
echo -e "${BLUE}🏢 Company Endpoints${RESET}"
test_endpoint "GET" "/api/v1/companies" "Get All Companies" "403"
test_endpoint "POST" "/api/v1/companies" "Create Company" "403" '{"name":"Test Company"}'
test_endpoint "GET" "/api/v1/companies/1" "Get Company by ID" "403"
test_endpoint "PUT" "/api/v1/companies/1" "Update Company" "403" '{"name":"Updated Company"}'
test_endpoint "DELETE" "/api/v1/companies/1" "Delete Company" "403"
echo ""

# Test Notifications Endpoints (require auth)
echo -e "${BLUE}🔔 Notification Endpoints${RESET}"
test_endpoint "GET" "/api/v1/notifications" "Get Notifications" "403"
test_endpoint "GET" "/api/v1/notifications/1" "Get Notification by ID" "403"
test_endpoint "PATCH" "/api/v1/notifications/1/read" "Mark as Read" "403"
test_endpoint "GET" "/api/v1/notifications/unread-count" "Get Unread Count" "403"
echo ""

# Test Subscriptions Endpoints (require auth)
echo -e "${BLUE}💳 Subscription Endpoints${RESET}"
test_endpoint "GET" "/api/v1/subscriptions/plans" "Get Subscription Plans" "403"
test_endpoint "GET" "/api/v1/subscriptions/current" "Get Current Subscription" "403"
test_endpoint "POST" "/api/v1/subscriptions/upgrade" "Upgrade Subscription" "403"
echo ""

# Test Payroll Endpoints (require auth)
echo -e "${BLUE}💰 Payroll Endpoints${RESET}"
test_endpoint "GET" "/api/v1/companies/1/payroll/summary" "Get Payroll Summary" "403"
test_endpoint "POST" "/api/v1/companies/1/payroll/runs" "Create Payroll Run" "403"
echo ""

# Test Compliance Endpoints (require auth)
echo -e "${BLUE}⚖️  Compliance Endpoints${RESET}"
test_endpoint "GET" "/api/v1/companies/1/compliance/obligations" "Get Obligations" "403"
test_endpoint "GET" "/api/v1/companies/1/compliance/filings" "Get Filings" "403"
test_endpoint "GET" "/api/v1/companies/1/compliance/calendar" "Get Calendar" "403"
echo ""

# Test Document Endpoints (require auth)
echo -e "${BLUE}📄 Document Endpoints${RESET}"
test_endpoint "GET" "/api/v1/companies/1/documents" "Get Documents" "403"
test_endpoint "POST" "/api/v1/companies/1/documents" "Upload Document" "403"
echo ""

# Print Summary
echo -e "\n${BLUE}╔════════════════════════════════════════════╗${RESET}"
echo -e "${BLUE}║         Test Results Summary              ║${RESET}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${RESET}\n"

echo -e "Total Tests:    ${BLUE}$total_tests${RESET}"
echo -e "Passed:         ${GREEN}$passed_tests${RESET}"
echo -e "Failed:         ${RED}$failed_tests${RESET}"
success_rate=$((passed_tests * 100 / total_tests))
echo -e "Success Rate:   ${YELLOW}${success_rate}%${RESET}\n"

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}✓ All endpoints are responding correctly!${RESET}\n"
    echo -e "${YELLOW}Note: Most endpoints return 403 (Forbidden) because they require authentication.${RESET}"
    echo -e "${YELLOW}This is expected behavior - use a valid JWT token to access protected endpoints.${RESET}\n"
else
    echo -e "${RED}✗ Some endpoints failed or are unreachable${RESET}\n"
fi
