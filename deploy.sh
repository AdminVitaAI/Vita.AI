#!/bin/bash

# Vita.AI Deployment Script
# This script helps deploy the Vita.AI application

set -e

echo "🚀 Starting Vita.AI Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    print_warning ".env file not found in backend directory"
    print_status "Creating .env file from template..."
    cp backend/.env.example backend/.env
    print_warning "Please edit backend/.env with your actual configuration"
    exit 1
fi

# Check for required environment variables
if ! grep -q "OPENAI_API_KEY=" backend/.env || grep -q "your-openai-api-key-here" backend/.env; then
    print_error "Please set your OPENAI_API_KEY in backend/.env"
    exit 1
fi

# Build frontend
print_status "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Copy frontend build to backend static folder
print_status "Copying frontend build to backend..."
rm -rf backend/src/static
cp -r frontend/dist backend/src/static

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Create database directory
print_status "Setting up database..."
mkdir -p backend/src/database

# Start the application
print_status "Starting the application..."
cd backend
python src/main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_status "✅ Backend is running successfully!"
    print_status "🌐 Application is available at: http://localhost:5000"
    print_status "📊 API Health Check: http://localhost:5000/api/health"
else
    print_error "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

print_status "🎉 Deployment completed successfully!"
print_status "Press Ctrl+C to stop the application"

# Wait for user to stop
wait $BACKEND_PID

