#!/bin/bash

# Test ComplianceHub API endpoints
echo -e "\n\033[32m🚀 Testing ComplianceHub API Endpoints\033[0m\n"

# Define endpoints to test
endpoints=(
    "http://localhost:3000/api/v1"
    "http://localhost:3000/api/v1/companies"
    "http://localhost:3000/api/v1/auth/register"
    "http://localhost:3000/api/v1/notifications"
    "http://localhost:3000/api/v1/subscriptions/plans"
)

echo -e "\033[33m⏳ Checking if server is running...\033[0m\n"

# Wait for server to be ready (max 30 seconds)
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000/api/v1 > /dev/null 2>&1; then
        echo -e "\033[32m✓ Server is running\033[0m\n"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -lt $max_attempts ]; then
        echo -n "."
        sleep 1
    else
        echo -e "\n\033[31m✗ Server is not responding\033[0m"
        echo "Make sure the server is started with: npm run start:prod"
        exit 1
    fi
done

# Test endpoints
echo -e "\033[33m🔍 Testing Endpoints:\033[0m\n"

passed=0
failed=0

for endpoint in "${endpoints[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "\033[32m✓\033[0m $endpoint - Status: $response"
        ((passed++))
    else
        echo -e "\033[31m✗\033[0m $endpoint - Status: $response"
        ((failed++))
    fi
done

# Summary
echo -e "\n\033[33m📊 Test Summary:\033[0m"
echo -e "\033[32mPassed: $passed\033[0m"
echo -e "\033[31mFailed: $failed\033[0m"
echo -e "\033[34mTotal: $((passed + failed))\033[0m\n"

if [ $failed -eq 0 ]; then
    echo -e "\033[32m✓ All endpoints are working!\033[0m\n"
    exit 0
else
    echo -e "\033[31m✗ Some endpoints failed\033[0m\n"
    exit 1
fi
