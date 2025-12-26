@echo off
REM ComplianceHub Backend - Quick Start Script for Windows

echo.
echo ===================================
echo ComplianceHub Backend API
echo Quick Start Setup
echo ===================================
echo.

REM Step 1: Navigate to project
echo 01 Navigating to project directory...
cd /d "c:\Users\USER\Desktop\Aegis\aegis-flow\NestJS backend\compliancehub" || exit /b

REM Step 2: Install dependencies
echo 02 Installing dependencies...
call npm install

REM Step 3: Create environment file
echo 03 Setting up environment variables...
if not exist .env (
    copy .env.example .env
    echo Created .env file - please edit with your database credentials
) else (
    echo .env already exists
)

REM Step 4: Display next steps
echo.
echo ===================================
echo Setup Instructions:
echo ===================================
echo.
echo 1. Edit .env with your MySQL database credentials:
echo    - DB_HOST: localhost
echo    - DB_PORT: 3306
echo    - DB_USER: root
echo    - DB_PASSWORD: your_password
echo    - DB_NAME: compliancehub_db
echo.
echo 2. Create the database (in MySQL):
echo    CREATE DATABASE compliancehub_db;
echo.
echo 3. Start the development server:
echo    npm run start:dev
echo.
echo 4. The API will be available at:
echo    http://localhost:3000/api/v1
echo.
echo Available commands:
echo   npm run start       - Production mode
echo   npm run start:dev   - Development mode with hot reload
echo   npm run build       - Build for production
echo   npm run test        - Run unit tests
echo.
echo ===================================
echo.

pause
