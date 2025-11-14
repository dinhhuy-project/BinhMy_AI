#!/usr/bin/env powershell
# Railway Deployment Setup Script for Windows

Write-Host "======================================" -ForegroundColor Green
Write-Host "  Railway Deployment Setup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "1️⃣  Checking Node.js..." -ForegroundColor Blue
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   ✅ Node.js $nodeVersion found" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js not found. Please install from nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "2️⃣  Checking npm..." -ForegroundColor Blue
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "   ✅ npm $npmVersion found" -ForegroundColor Green
} else {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "3️⃣  Installing dependencies..." -ForegroundColor Blue
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env if not exists
Write-Host "4️⃣  Checking .env file..." -ForegroundColor Blue
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   ✅ Created .env from .env.example" -ForegroundColor Green
        Write-Host "   ⚠️  Edit .env with your configuration values!" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ .env.example not found" -ForegroundColor Red
    }
} else {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
}

# Build frontend
Write-Host "5️⃣  Building frontend..." -ForegroundColor Blue
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build failed" -ForegroundColor Red
    exit 1
}

# Display next steps
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Setup Complete! ✨" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Edit .env file with your configuration:" -ForegroundColor Cyan
Write-Host "   - VITE_GEMINI_API_KEY" -ForegroundColor Gray
Write-Host "   - MONGODB_URI (MongoDB Atlas connection)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test locally:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Push to GitHub:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Setup for Railway deployment'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy on Railway:" -ForegroundColor Cyan
Write-Host "   - Go to https://railway.app" -ForegroundColor Gray
Write-Host "   - Create new project from GitHub repo" -ForegroundColor Gray
Write-Host "   - Add environment variables in Railway dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For detailed instructions, see: RAILWAY_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host "✅ For pre-deployment checklist, see: DEPLOYMENT_CHECKLIST.md" -ForegroundColor Cyan
Write-Host ""
