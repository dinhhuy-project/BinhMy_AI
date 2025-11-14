#!/usr/bin/env node

/**
 * 🎯 QUICK START - API FIX CHEAT SHEET
 * 
 * File này là hướng dẫn nhanh để fix API issues
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                   API FIX CHEAT SHEET                             ║
║                                                                    ║
║              Port Changed: 5000 → 3001                            ║
║              Status: ✅ FIXED & READY                             ║
╚════════════════════════════════════════════════════════════════════╝

📋 PROBLEMS FIXED
═══════════════════════════════════════════════════════════════════

1. API Port Mismatch
   ❌ Frontend đang gọi: http://localhost:5000/api
   ❌ Backend đang chạy: http://localhost:3001/api
   ✅ FIXED: Frontend bây giờ gọi port 3001

2. Environment Variables Not Loading
   ❌ process.env không hoạt động trong browser
   ✅ FIXED: Sử dụng window.__API_BASE_URL__ được inject từ Vite

3. Missing Vite Config
   ❌ VITE_API_URL không được pass vào frontend
   ✅ FIXED: Thêm define: 'window.__API_BASE_URL__'


🔧 FILES UPDATED
═══════════════════════════════════════════════════════════════════

✅ services/apiService.ts
   - Thêm getApiBaseUrl() function
   - Get API URL từ window object

✅ vite.config.ts
   - Thêm: 'window.__API_BASE_URL__': JSON.stringify(env.VITE_API_URL)

✅ .env (không thay đổi nhưng confirm)
   - VITE_API_URL=http://localhost:3001/api
   - PORT=3001

✅ api-test.js (NEW)
   - Test suite để verify API hoạt động
   - Test tất cả 9 endpoints

✅ API_FIX_GUIDE.md (NEW)
   - Tài liệu chi tiết


🚀 HOW TO FIX IT
═══════════════════════════════════════════════════════════════════

1. Xóa node_modules cache:
   rm -r node_modules/.vite
   (Hoặc xóa thủ công)

2. Install lại dependencies (nếu cần):
   npm install

3. Chạy dev server:
   npm run dev:all

4. Chờ thông báo:
   ✓ MongoDB connected successfully
   ✓ Server is running on http://localhost:3001
   ✓ Vite ready on http://localhost:3000


✅ VERIFICATION
═══════════════════════════════════════════════════════════════════

COMMAND LINE TEST:
  curl http://localhost:3001/api/health
  
EXPECTED RESPONSE:
  {"status":"OK","message":"Server is running"}

BROWSER TEST:
  1. Mở http://localhost:3000
  2. F12 → Console
  3. Paste:
     fetch('http://localhost:3001/api/health')
       .then(r => r.json())
       .then(d => console.log(d))

EXPECTED: ✅ No CORS error, data displayed

FULL TEST SUITE:
  node api-test.js
  
EXPECTED: ✅ All 9 tests PASS


📊 API ENDPOINTS
═══════════════════════════════════════════════════════════════════

Base URL: http://localhost:3001/api

✓ GET   /health                    - Health check
✓ POST  /images                    - Save image
✓ GET   /images                    - Get all images
✓ GET   /images/:imageId           - Get by ID
✓ GET   /images/search?q=          - Search
✓ GET   /images/source/:source     - Get by source
✓ PUT   /images/:imageId           - Update
✓ DELETE /images/:imageId          - Delete
✓ GET   /statistics                - Get stats


🐛 IF STILL NOT WORKING
═══════════════════════════════════════════════════════════════════

1. Check if port 3001 is free:
   netstat -ano | findstr :3001
   
   If busy, kill process:
   taskkill /PID <PID> /F

2. Check MongoDB connection:
   • Open .env
   • Verify MONGODB_URI
   • Test connection in MongoDB Compass

3. Check if Vite is serving frontend correctly:
   • Open http://localhost:3000
   • Check F12 Network tab
   • Request to /api should go to http://localhost:3001

4. Clear all caches:
   rm -rf node_modules/.vite
   rm -rf dist
   npm run build

5. Restart everything:
   Kill all npm processes
   npm run dev:all


🔄 STEP-BY-STEP FIX PROCESS
═══════════════════════════════════════════════════════════════════

STEP 1: Kill old processes
  taskkill /F /IM node.exe

STEP 2: Clear cache
  del /s /q node_modules\\.vite 2>nul
  
STEP 3: Run dev server
  npm run dev:all

STEP 4: Wait for both to start
  [0] ✓ MongoDB connected successfully
  [0] 🚀 Server is running on http://localhost:3001
  [1] ➜ Local: http://localhost:3000/

STEP 5: Test
  • Open http://localhost:3000
  • Open http://localhost:3001/api/health
  • Run: node api-test.js

STEP 6: Verify in browser
  • F12 → Console
  • Upload image or search
  • Check if data saves to MongoDB


📚 USEFUL REFERENCES
═══════════════════════════════════════════════════════════════════

• API_FIX_GUIDE.md        - Detailed troubleshooting
• API_FIX_COMPLETE.txt    - Complete guide
• api-test.js             - Run tests
• test-api.bat            - Windows batch tester


✨ SUMMARY
═══════════════════════════════════════════════════════════════════

BEFORE:
  ❌ Frontend calling port 5000
  ❌ Server running on port 3001
  ❌ CORS/Connection errors
  ❌ Images not saving

AFTER:
  ✅ Frontend calling port 3001
  ✅ Server running on port 3001
  ✅ No CORS errors
  ✅ Images saving to MongoDB


🎯 QUICK COMMANDS
═══════════════════════════════════════════════════════════════════

npm run dev:all         - Start both frontend & backend
node api-test.js        - Run full test suite
curl http://localhost:3001/api/health  - Check health
npm run build           - Build for production


═══════════════════════════════════════════════════════════════════

Status: ✅ COMPLETE
Date: November 14, 2025

Ready to use! 🚀

═══════════════════════════════════════════════════════════════════
`);
