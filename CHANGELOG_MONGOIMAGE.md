# 📋 API Update Summary - MongoImage Interface

## ✨ Thay Đổi Chính

### 1. **Cấu Trúc Dữ Liệu Mới: MongoImage**

Interface `MongoImage` thay thế cấu trúc cũ, cung cấp các trường chi tiết hơn:

```typescript
export interface MongoImage {
  _id?: string;                      // MongoDB ID
  searchQuery: string;               // Câu tìm kiếm
  imageId: string;                   // ID ảnh
  imageName: string;                 // Tên file
  imageUrl?: string;                 // URL ảnh
  imageBase64?: string;              // Base64 data
  mimeType: string;                  // MIME type
  matchScore: number;                // Score (0-100)
  matchReason: string;               // Lý do
  source: 'google-drive' | 'upload'; // Nguồn
  driveFileId?: string;              // Google Drive ID
  createdAt?: Date;                  // Ngày tạo
  updatedAt?: Date;                  // Ngày cập nhật
}
```

### 2. **API Endpoints Cập Nhật**

#### POST /api/images (Lưu Ảnh)
```javascript
// Mới
{
  searchQuery: "con chó",
  imageId: "img_123",
  imageName: "dog.jpg",
  mimeType: "image/jpeg",
  matchScore: 95,
  matchReason: "...",
  source: "upload"
}

// Cũ
{
  query: "con chó",
  imageFileName: "dog.jpg",
  matchScore: 95,
  ...
}
```

#### GET /api/images/source/:source (Mới)
Lấy ảnh theo nguồn (upload hoặc google-drive)

#### GET /api/images/search (Cập Nhật)
Tìm kiếm theo `searchQuery` thay vì `query`

#### Các Endpoints Mới
- `GET /api/images/:imageId` - Lấy ảnh theo ID
- `PUT /api/images/:imageId` - Cập nhật ảnh
- `DELETE /api/images/:imageId` - Xóa ảnh
- `GET /api/statistics` - Thống kê (cải thiện)

### 3. **Frontend Integration**

#### App.tsx
```typescript
// Cũ
await saveSearchResultToBackend({
  query: currentQuery,
  imageFileName: topMatch.image.file.name,
  ...
});

// Mới
const mongoImageData: Omit<MongoImage, '_id' | 'createdAt' | 'updatedAt'> = {
  searchQuery: currentQuery,
  imageId: topMatch.image.id,
  imageName: topMatch.image.file.name,
  imageBase64: topMatch.image.base64,
  ...
  source: 'upload',
};
await saveImageToMongoDB(mongoImageData);
```

#### services/apiService.ts
```typescript
// Cũ
export const saveSearchResultToBackend = async (payload) => { ... }
export const getAllSearchResults = async () => { ... }

// Mới
export const saveImageToMongoDB = async (payload) => { ... }
export const getAllImages = async () => { ... }
export const getImagesBySource = async (source) => { ... }
export const deleteImage = async (imageId) => { ... }
export const updateMongoImage = async (imageId, updateData) => { ... }
```

### 4. **Backend Updates**

#### server.js
- Collection đổi từ `search_results` → `images`
- Thêm validation cho `source` field
- Thêm indexes cho performance
- Response format được standardize

#### Indexes
```javascript
// Tạo các indexes tối ưu:
- searchQuery: 1
- imageId: 1
- source: 1
- createdAt: -1
- matchScore: -1
```

#### Statistics (Cải Thiện)
```json
{
  "totalImages": 42,
  "topQueries": [...],
  "sourceBreakdown": [...],
  "averageMatchScore": 85.3
}
```

### 5. **Files Cập Nhật/Tạo**

| File | Trạng Thái | Ghi Chú |
|------|-----------|--------|
| `types.ts` | ✅ Cập nhật | Thêm `MongoImage` interface |
| `services/apiService.ts` | ✅ Cập nhật | Tất cả functions mới |
| `App.tsx` | ✅ Cập nhật | Sử dụng `saveImageToMongoDB` |
| `server.js` | ✅ Cập nhật | 9 endpoints mới |
| `API_EXAMPLES.js` | ✅ Cập nhật | Ví dụ mới cho MongoImage |
| `MONGODB_API_SETUP.md` | ✅ Cập nhật | Tài liệu chi tiết |

## 🔄 Migration Path

Nếu bạn có dữ liệu cũ từ collection `search_results`:

```javascript
// Script migration
db.search_results.find().forEach(doc => {
  db.images.insertOne({
    searchQuery: doc.query,
    imageId: 'migrated_' + doc._id,
    imageName: doc.imageFileName,
    imageUrl: doc.imageUrl,
    mimeType: doc.imageMimeType,
    matchScore: doc.matchScore,
    matchReason: doc.matchReason,
    source: 'migrated',
    driveFileId: null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
});

// Sau đó xóa collection cũ
db.search_results.drop();
```

## 📊 Thống Kê So Sánh

| Tiêu Chí | Cũ | Mới |
|----------|----|----|
| Collection Name | search_results | images |
| Fields | 8 | 12 |
| Endpoints | 4 | 9 |
| Source Tracking | ❌ | ✅ |
| Delete Support | ❌ | ✅ |
| Update Support | ❌ | ✅ |
| Statistics Detail | Cơ bản | Chi tiết |
| Indexes | 2 | 5 |

## 🚀 Bắt Đầu

1. **Cài dependencies:**
   ```bash
   npm install
   ```

2. **Khởi động services:**
   ```bash
   # Terminal 1
   npm run dev:server

   # Terminal 2
   npm run dev
   ```

3. **Test API:**
   ```bash
   # Terminal 3
   node API_EXAMPLES.js
   # hoặc dùng Postman
   ```

## 📝 Changelog

### v2.0.0 (Current)
- ✅ Thay đổi interface sang `MongoImage`
- ✅ Thêm 5 endpoints mới
- ✅ Cải thiện thống kê
- ✅ Support source tracking
- ✅ Add CRUD operations đầy đủ

### v1.0.0 (Previous)
- Basic search results storage
- 4 endpoints
- Simple statistics

## ❓ FAQ

**Q: Dữ liệu cũ có bị mất không?**
A: Có, nếu bạn đổi collection name. Sử dụng script migration ở trên.

**Q: Có cần update MongoDB không?**
A: Không, MongoDB version cũ vẫn hoạt động bình thường.

**Q: Source field bắt buộc không?**
A: Có, phải là `'upload'` hoặc `'google-drive'`

**Q: Base64 image cần lưu không?**
A: Tuỳ chọn, có thể để null nếu chỉ cần URL

---

**Cập nhật ngày:** November 14, 2025  
**Phiên bản:** 2.0.0
