#!/bin/bash
# ComplianceHub Backend - Quick Start Script

echo "==================================="
echo "ComplianceHub Backend API"
echo "Quick Start Setup"
echo "==================================="
echo ""

# Step 1: Navigate to project
echo "📁 Navigating to project directory..."
cd "c:\Users\USER\Desktop\Aegis\aegis-flow\NestJS backend\compliancehub" || exit

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Create environment file
echo "⚙️  Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env created - please edit with your database credentials"
else
    echo "✅ .env already exists"
fi

# Step 4: Check MySQL
echo "🗄️  Checking MySQL connection..."
echo "Please ensure MySQL is running and the database credentials in .env are correct"

# Step 5: Start development server
echo ""
echo "🚀 Starting development server..."
echo "The API will be available at: http://localhost:3000/api/v1"
echo ""
echo "Available commands:"
echo "  npm run start       - Run in production mode"
echo "  npm run start:dev   - Run in development mode with hot reload"
echo "  npm run build       - Build for production"
echo "  npm run test        - Run unit tests"
echo "  npm run test:e2e    - Run e2e tests"
echo ""

npm run start:dev
