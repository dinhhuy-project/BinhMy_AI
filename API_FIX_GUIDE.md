## 🔧 API Debug & Fix

### ❌ Vấn Đề Phát Hiện

API không hoạt động do các nguyên nhân sau:

#### 1. **Cấu hình Port Sai**
   - ❌ File `services/apiService.ts` sử dụng hardcoded port `5000`
   - ✅ Server thực tế chạy trên port `3001`
   - 🔧 **Fix**: Cập nhật API URL thành `http://localhost:3001/api`

#### 2. **Environment Variables Không Được Load**
   - ❌ Vite không inject `VITE_API_URL` vào frontend
   - ✅ **Fix**: Thêm `define` trong `vite.config.ts`

#### 3. **TypeScript Mismatch**
   - ❌ `process.env` không tương thích với browser environment
   - ✅ **Fix**: Sử dụng `window` global object

---

## ✅ Các Sửa Lỗi Đã Thực Hiện

### 1. **Sửa services/apiService.ts**

```typescript
// ❌ CŨ - Sai port
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

// ✅ MỚI - Correct
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  return 'http://localhost:3001/api';
};
const API_BASE_URL = getApiBaseUrl();
```

### 2. **Cập nhật vite.config.ts**

```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'window.__API_BASE_URL__': JSON.stringify(env.VITE_API_URL || 'http://localhost:3001/api'),
},
```

### 3. **Cấu hình .env**

```env
GEMINI_API_KEY=AIzaSyDSwJp_V2_-LKU0UzrZ6MtFA1fBzsRjUpo
MONGODB_URI=mongodb+srv://buidinhhuy900_db_user:aloalo123@aisearch.mversnf.mongodb.net/?appName=AISearch
VITE_API_URL=http://localhost:3001/api
PORT=3001
```

---

## 🚀 Cách Chạy & Kiểm Tra

### 1. **Khởi Động Server & Client**

```bash
npm run dev:all
```

Bạn sẽ thấy:
```
✓ MongoDB connected successfully
🚀 Server is running on http://localhost:3001

VITE v6.4.1 ready in 327 ms
➜ Local: http://localhost:3000/
```

### 2. **Kiểm Tra API Health**

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 3. **Chạy Test Suite Toàn Diện**

```bash
node api-test.js
```

Output:
```
✅ Health Check - PASSED
✅ Save Image (POST /api/images) - PASSED
✅ Get All Images (GET /api/images) - PASSED
✅ Search Images (GET /api/images/search) - PASSED
✅ Get Image by ID - PASSED
✅ Get by Source (GET /api/images/source/upload) - PASSED
✅ Get Statistics (GET /api/statistics) - PASSED
✅ Update Image (PUT /api/images/:id) - PASSED
✅ Delete Image (DELETE /api/images/:id) - PASSED
```

---

## 📋 API Endpoints

### Health Check
```
GET /api/health
Response: { status: "OK", message: "Server is running" }
```

### Save Image
```
POST /api/images
Body: {
  searchQuery: string,
  imageId: string,
  imageName: string,
  imageUrl?: string,
  mimeType: string,
  matchScore: number,
  matchReason: string,
  source: 'upload' | 'google-drive'
}
Response: { success: true, data: MongoImage, message: string }
```

### Get All Images
```
GET /api/images
Response: { success: true, data: MongoImage[], count: number }
```

### Search Images
```
GET /api/images/search?q=query
Response: { success: true, data: MongoImage[], count: number }
```

### Get Image by ID
```
GET /api/images/:imageId
Response: { success: true, data: MongoImage }
```

### Get Images by Source
```
GET /api/images/source/upload
GET /api/images/source/google-drive
Response: { success: true, data: MongoImage[], count: number }
```

### Update Image
```
PUT /api/images/:imageId
Body: { matchScore?: number, matchReason?: string }
Response: { success: true, data: MongoImage }
```

### Delete Image
```
DELETE /api/images/:imageId
Response: { success: true, message: string }
```

### Get Statistics
```
GET /api/statistics
Response: {
  success: true,
  data: {
    totalImages: number,
    topQueries: Array<{query: string, count: number}>,
    sourceBreakdown: {upload: number, 'google-drive': number},
    averageMatchScore: number
  }
}
```

---

## 🧪 Chạy Test API từ Browser

1. Mở `http://localhost:3000`
2. Mở Console (F12)
3. Copy-paste code này:

```javascript
// Test Health
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Health:', d))
  .catch(e => console.error('❌ Error:', e));

// Test Save Image
fetch('http://localhost:3001/api/images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    searchQuery: 'Test',
    imageId: 'test_123',
    imageName: 'test.jpg',
    mimeType: 'image/jpeg',
    matchScore: 90,
    matchReason: 'Test',
    source: 'upload'
  })
})
  .then(r => r.json())
  .then(d => console.log('✅ Saved:', d))
  .catch(e => console.error('❌ Error:', e));

// Test Get All
fetch('http://localhost:3001/api/images')
  .then(r => r.json())
  .then(d => console.log('✅ All images:', d))
  .catch(e => console.error('❌ Error:', e));
```

---

## 🐛 Troubleshooting

### ❌ "Cannot GET /api/health"
- Kiểm tra server có chạy không: `npm run dev:server`
- Kiểm tra port: `netstat -ano | findstr :3001`

### ❌ "Failed to connect to MongoDB"
- Kiểm tra MONGODB_URI trong .env
- Kiểm tra MongoDB service đang chạy
- Kiểm tra network connection

### ❌ "CORS Error"
- CORS middleware đã enable trong server.js
- Kiểm tra frontend call đúng URL

### ❌ "API returns 404"
- Kiểm tra endpoint URL
- Kiểm tra route definition trong server.js

### ❌ "Images not saved to MongoDB"
- Kiểm tra MongoDB connection
- Kiểm tra API response (F12 Console)
- Chạy: `node api-test.js`

---

## 📁 Files Updated

✅ `services/apiService.ts`
   - Fixed API_BASE_URL configuration
   - Added getApiBaseUrl() function

✅ `vite.config.ts`
   - Added window.__API_BASE_URL__ define

✅ `.env`
   - Confirmed VITE_API_URL=http://localhost:3001/api

✅ `api-test.js` (NEW)
   - Complete API test suite

---

## 🎯 Next Steps

1. ✅ Chạy: `npm run dev:all`
2. ✅ Mở: `http://localhost:3000`
3. ✅ Test API: `node api-test.js`
4. ✅ Upload ảnh hoặc tìm kiếm
5. ✅ Kiểm tra MongoDB: data được lưu?
6. ✅ Xem stats: `http://localhost:3001/api/statistics`

---

**Status**: ✅ API Fixed & Ready
**Created**: November 14, 2025
**Port**: 3001 (Backend), 3000 (Frontend)
