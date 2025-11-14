# 🔧 Fix API Issues on Railway

**Status:** API không hoạt động sau deploy
**Cause:** Frontend API URL và CORS configuration

## ❌ Vấn Đề

API returns 404 hoặc không respond sau khi deploy trên Railway

### Nguyên Nhân Có Thể

1. **Frontend gọi API sai URL**
   - Frontend build time gọi `http://localhost:3001/api` (hardcoded)
   - Nhưng trên Railway backend ở port khác
   
2. **CORS không được config đúng**
   - Frontend & Backend ở domain khác
   
3. **Environment variables không set**
   - `MONGODB_URI` không được set trên Railway
   - `VITE_GEMINI_API_KEY` không được set

4. **MongoDB connection fail**
   - Backend không kết nối được MongoDB

---

## ✅ Giải Pháp (3 Bước)

### **Bước 1: Fix Frontend API URL**

Tôi đã cập nhật `apiService.ts` để:
- ✅ Gọi API đến `/api` (relative URL) khi production
- ✅ Gọi API đến `http://localhost:3001/api` khi development

**File đã sửa:** `services/apiService.ts`

```typescript
const getApiBaseUrl = (): string => {
  // Dùng relative URL cho production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';  // ✅ Frontend gọi /api (cùng domain)
  }
  
  // Dùng localhost cho development
  return 'http://localhost:3001/api';
};
```

### **Bước 2: Fix Vite Config**

Loại bỏ hardcoded API URL từ build time

**File đã sửa:** `vite.config.ts`

```typescript
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
  // Xóa window.__API_BASE_URL__ - để apiService.ts handle dynamically
},
```

### **Bước 3: Verify Environment Variables**

Trong Railway Dashboard, đảm bảo đã set:

```
✅ MONGODB_URI = your_mongodb_atlas_connection_string
✅ DATABASE_NAME = ai_image_finder
✅ VITE_GEMINI_API_KEY = your_api_key
✅ NODE_ENV = production
```

---

## 🚀 Deploy Fix

### Local Test Trước:

```bash
# 1. Rebuild frontend
npm run build

# 2. Test locally
npm start

# 3. Test API
curl http://localhost:3001/api/health
```

### Deploy to Railway:

```bash
# 1. Commit changes
git add .
git commit -m "Fix: API URL detection for production"

# 2. Push to GitHub
git push origin main

# 3. Railway auto-redeploy
# Kiểm tra Railway logs
```

---

## 🔍 Troubleshooting

### API vẫn không hoạt động?

#### **Check 1: Xem logs trên Railway**

```
Railway Dashboard
→ Project
→ Logs tab
→ Tìm error messages
```

Kiếm các dòng:
- ❌ `MongoDB connection failed` → MONGODB_URI không đúng
- ❌ `Route not found` → API endpoint không tồn tại
- ❌ `CORS error` → Cross-origin issue

#### **Check 2: Kiểm tra Frontend Console**

Browser → DevTools → Console → Tìm error messages

Errors sẽ show:
- API URL được gọi
- Network errors
- CORS errors

#### **Check 3: Test Health Endpoint**

```bash
# Replace với domain của bạn
curl https://binhmyai-production.up.railway.app/api/health

# Response expected:
# {"success": true, "message": "API is running"}
```

#### **Check 4: Kiểm tra Build Process**

```bash
# Rebuild locally
npm run build

# Check dist/ folder tồn tại
ls dist/

# Should see:
# index.html
# assets/
```

---

## 📋 Checklist

- [ ] Code changes committed
- [ ] Pushed to GitHub main branch
- [ ] Railway auto-deployed
- [ ] Logs show "Deployment successful"
- [ ] MongoDB connection log shows "✓ MongoDB connected"
- [ ] Test `/api/health` endpoint
- [ ] Frontend loads without errors
- [ ] API calls working in console

---

## 🔗 Related Files Changed

1. **services/apiService.ts** - Frontend API client
2. **vite.config.ts** - Build configuration
3. **server.js** - Backend API (already has CORS)
4. **package.json** - Production start script

---

## 📞 If Still Not Working

1. **Check Railway logs carefully** - Most errors are logged
2. **Check browser DevTools Console** - Frontend errors
3. **Check if MongoDB Atlas** - Connection string valid?
4. **Check if CORS** - Response headers have `Access-Control-Allow-Origin`?

### Common Errors:

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot connect to MongoDB` | MONGODB_URI wrong | Update in Railway Dashboard |
| `API returns 404` | Endpoint doesn't exist | Check server.js for endpoint |
| `CORS error` | Frontend & API different domain | Use `/api` relative URL |
| `API timeout` | Database slow | Check MongoDB query performance |

---

## ✨ Summary

**Đã fix:**
- ✅ Frontend API URL detection (relative URL for production)
- ✅ Removed hardcoded API URLs
- ✅ Proper environment variable handling

**Cần test:**
- ✅ Rebuild & deploy
- ✅ Check Railway logs
- ✅ Verify /api/health works
- ✅ Test API endpoints

**Deploy and monitor!** 🚀
