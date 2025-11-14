# 🔧 Fix: Gemini API Key Not Found Error

**Error:** `Uncaught Error: An API Key must be set when running in a browser`

**Root Cause:** `VITE_GEMINI_API_KEY` environment variable không được set trên Railway

---

## ❌ Vấn Đề

Frontend không thể gọi Gemini AI vì:
1. `VITE_GEMINI_API_KEY` không được set trong Railway environment
2. Vite không inject API key vào frontend build
3. Frontend runtime không tìm được API key

---

## ✅ Giải Pháp

### **Bước 1: Update Railway Environment Variables**

Trong Railway Dashboard, thêm/cập nhật biến này:

```
VITE_GEMINI_API_KEY=AIzaSyDSwJp_V2_-LKU0UzrZ6MtFA1fBzsRjUpo
```

**Không cần:**
```
GEMINI_API_KEY=...         ❌ (server-side, không dùng)
API_KEY=...                ❌ (server-side, không dùng)
```

### **Bước 2: Code Changes (Đã Hoàn Thành)**

Tôi đã update các file:

1. **vite.config.ts**
   - ✅ Inject `VITE_GEMINI_API_KEY` vào frontend build
   - ✅ Support cả `VITE_GEMINI_API_KEY` và `GEMINI_API_KEY`

2. **services/geminiService.ts**
   - ✅ Kiểm tra `import.meta.env.VITE_GEMINI_API_KEY` (Vite env var)
   - ✅ Fallback đến `process.env.VITE_GEMINI_API_KEY`
   - ✅ Support `window.__GEMINI_API_KEY__` (if injected)
   - ✅ Better error messages

3. **.env.example**
   - ✅ Chỉ rõ cần `VITE_GEMINI_API_KEY` (frontend)

---

## 🚀 Deploy Fix

### Local Test:

```bash
# 1. Edit .env locally
# VITE_GEMINI_API_KEY=AIzaSyDSwJp_V2_-LKU0UzrZ6MtFA1fBzsRjUpo

# 2. Rebuild
npm run build

# 3. Test locally
npm start

# 4. Check console - should not see API key error
```

### Push to Railway:

```bash
# 1. Commit
git add .
git commit -m "Fix: Properly handle VITE_GEMINI_API_KEY for frontend"

# 2. Push
git push origin main

# 3. Railway auto-redeploy
```

---

## 🔍 Verify After Deploy

### Check 1: Inspect in DevTools

Browser → DevTools → Console

Should see:
```
✅ API Base URL: /api
✅ No "API Key must be set" error
```

### Check 2: Test Image Search

1. Open app
2. Upload an image
3. Enter search query
4. Click Search
5. Should work without "API Key must be set" error

### Check 3: Check Network Tab

DevTools → Network tab

Look for requests to:
- `/api/images` (POST) - to save results

Should be ✅ 200 OK

---

## 📋 Complete Railway Environment Variables

Set these in Railway Dashboard:

```
# Frontend - REQUIRED
VITE_GEMINI_API_KEY=AIzaSyDSwJp_V2_-LKU0UzrZ6MtFA1fBzsRjUpo

# Backend - REQUIRED
MONGODB_URI=mongodb+srv://buidinhhuy900_db_user:aloalo123@aisearch.mversnf.mongodb.net/?appName=AISearch
DATABASE_NAME=ai_image_finder

# Optional
NODE_ENV=production
VITE_API_URL=/api
LOG_LEVEL=info
```

### ❌ Remove These (Not Used):

```
GEMINI_API_KEY        ❌ 서버 쪽 (사용하지 않음)
API_KEY               ❌ 서버 쪽 (사용하지 않음)
GOOGLE_DRIVE_API_KEY  ❌ (나중에 사용할 수도 있음)
CORS_ORIGIN           ❌ (Express CORS가 * 허용)
```

---

## 🆘 If Still Getting Error

### Error: "API Key must be set when running in a browser"

**Solution:**
1. ✅ Check Railway Dashboard - is `VITE_GEMINI_API_KEY` set?
2. ✅ Rebuild locally with `VITE_GEMINI_API_KEY` in .env
3. ✅ Check DevTools console - what's the actual error?
4. ✅ Check build process - `npm run build` succeeds?

### Error: "VITE_GEMINI_API_KEY not found in Railway"

**Solution:**
1. Go to Railway Dashboard
2. Click Project
3. Click "Variables" tab
4. Add new variable: `VITE_GEMINI_API_KEY`
5. Paste API key: `AIzaSyDSwJp_V2_-LKU0UzrZ6MtFA1fBzsRjUpo`
6. Railway auto-redeploys

### Error: "Still getting error after Railway redeploy"

**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R`)
2. Clear browser cache
3. Check if Railway finished deployment
4. Check build logs in Railway for errors

---

## ✨ Summary

**What was wrong:**
- ❌ `VITE_GEMINI_API_KEY` not set in Railway environment
- ❌ Frontend didn't know how to get API key at runtime
- ❌ Vite config didn't inject key properly

**What's fixed:**
- ✅ geminiService.ts properly detects API key
- ✅ vite.config.ts injects `VITE_GEMINI_API_KEY` into build
- ✅ Better error messages
- ✅ Support multiple env var names

**What you need to do:**
1. ✅ Set `VITE_GEMINI_API_KEY` in Railway Dashboard
2. ✅ Push code to GitHub (auto-redeploy)
3. ✅ Test in browser

---

## 🔗 Files Changed

- `services/geminiService.ts` - API key detection
- `vite.config.ts` - Inject API key into build
- `.env.example` - Documentation

**Deploy now!** 🚀
