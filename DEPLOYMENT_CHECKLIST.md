# ✅ Railway Deployment Checklist

## Pre-Deployment Verification

### Code Preparation
- [x] ✅ `package.json` - Updated with production scripts
- [x] ✅ `server.js` - Updated to serve frontend build + API
- [x] ✅ `.env.example` - Created with all required variables
- [x] ✅ `railway.json` - Configuration file created
- [x] ✅ `railway.toml` - Alternative configuration file
- [x] ✅ `Procfile` - Process file for web dyno

### Configuration Files
- [x] ✅ `RAILWAY_DEPLOYMENT.md` - Comprehensive deployment guide
- [x] ✅ `setup-railway.js` - Setup script for environment validation
- [x] ✅ `.gitignore` - Ensure `.env` is ignored (check manually)

## Before Deploying to Railway

### Step 1: Prepare Git Repository
```bash
# Navigate to project root
cd d:\BinhMy_AI

# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Setup for Railway deployment"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/your-username/your-repo.git

# Push to main branch
git push -u origin main
```

### Step 2: Prepare External Services

**MongoDB**:
- [ ] Create MongoDB Atlas account (mongodb.com/cloud)
- [ ] Create a cluster
- [ ] Get connection string (MONGODB_URI)
- [ ] Add Railway IP to whitelist or set 0.0.0.0/0

**Google Gemini API**:
- [ ] Go to aistudio.google.com
- [ ] Create API key
- [ ] Copy the key (VITE_GEMINI_API_KEY)

### Step 3: Create Railway Project
- [ ] Sign up/login to railway.app
- [ ] Create new project
- [ ] Connect GitHub account
- [ ] Select your repository

### Step 4: Configure Environment Variables in Railway

In Railway Dashboard, set these variables:

**Frontend**:
```
VITE_GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
```

**Backend**:
```
MONGODB_URI=your_mongodb_atlas_connection_string
DATABASE_NAME=ai_image_finder
NODE_ENV=production
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

### Step 5: Monitor Deployment

- [ ] Watch build logs in Railway dashboard
- [ ] Wait for "Deployment successful" message
- [ ] Check app URL is accessible

### Step 6: Test Application

- [ ] Visit https://your-app.up.railway.app in browser
- [ ] Frontend should load
- [ ] Test API: https://your-app.up.railway.app/api/health
- [ ] Test image upload functionality
- [ ] Test search functionality

## Troubleshooting Commands

```bash
# View build logs (in Railway dashboard)
# If build fails, check for:
# 1. Node.js version compatibility
# 2. Missing dependencies
# 3. Syntax errors

# Check if MongoDB connection works
curl https://your-app.up.railway.app/api/health

# View live logs (if you have Railway CLI)
railway logs
```

## After Successful Deployment

- [ ] Update DNS/domain if using custom domain
- [ ] Set up monitoring/alerts (optional)
- [ ] Document any custom configurations
- [ ] Test all features thoroughly
- [ ] Set up CI/CD for automatic deployments

## Important Notes

⚠️ **Security**:
- Never commit `.env` file
- Use Railway environment variables for sensitive data
- Enable HTTPS (Railway does this automatically)
- Keep API keys secure

📝 **Updates**:
- Simply push to GitHub and Railway will auto-redeploy
- Monitor build and deployment status
- Check logs if something breaks

🔧 **Local Testing Before Deploy**:
```bash
# Test build locally
npm run build

# Test production build locally
npm start
```

## File Structure After Build

```
project-root/
├── dist/                    # Frontend build (created by npm run build)
│   ├── index.html
│   ├── assets/
│   └── ...
├── server.js               # Express server that serves both frontend & API
├── package.json
├── railway.json           # Railway config
├── Procfile              # Process file
├── .env                  # Don't commit this!
├── .env.example          # Commit this as reference
└── ...
```

---

**Questions?** Check RAILWAY_DEPLOYMENT.md for detailed instructions!
