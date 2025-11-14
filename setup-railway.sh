#!/bin/bash

# Railway Deployment Setup Script for Linux/Mac

echo "======================================"
echo "  Railway Deployment Setup"
echo "======================================"
echo ""

# Check Node.js
echo "1️⃣  Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "   ❌ Node.js not found. Please install from nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "   ✅ Node.js $NODE_VERSION found"

# Check npm
echo "2️⃣  Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "   ❌ npm not found"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo "   ✅ npm $NPM_VERSION found"

# Install dependencies
echo "3️⃣  Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ❌ Failed to install dependencies"
    exit 1
fi

# Create .env if not exists
echo "4️⃣  Checking .env file..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   ✅ Created .env from .env.example"
        echo "   ⚠️  Edit .env with your configuration values!"
    else
        echo "   ❌ .env.example not found"
    fi
else
    echo "   ✅ .env file exists"
fi

# Build frontend
echo "5️⃣  Building frontend..."
npm run build
if [ $? -eq 0 ]; then
    echo "   ✅ Frontend built successfully"
else
    echo "   ❌ Build failed"
    exit 1
fi

# Display next steps
echo ""
echo "======================================"
echo "  Setup Complete! ✨"
echo "======================================"
echo ""

echo "📋 Next Steps:"
echo ""
echo "1. Edit .env file with your configuration:"
echo "   - VITE_GEMINI_API_KEY"
echo "   - MONGODB_URI (MongoDB Atlas connection)"
echo ""
echo "2. Test locally:"
echo "   npm start"
echo ""
echo "3. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Setup for Railway deployment'"
echo "   git push origin main"
echo ""
echo "4. Deploy on Railway:"
echo "   - Go to https://railway.app"
echo "   - Create new project from GitHub repo"
echo "   - Add environment variables in Railway dashboard"
echo ""
echo "📖 For detailed instructions, see: RAILWAY_DEPLOYMENT.md"
echo "✅ For pre-deployment checklist, see: DEPLOYMENT_CHECKLIST.md"
echo ""
