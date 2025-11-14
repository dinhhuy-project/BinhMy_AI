# Hướng Dẫn Cài Đặt API MongoDB

## Tổng Quan

Dự án này bây giờ có backend API để lưu các kết quả tìm kiếm ảnh lên MongoDB. Khi AI tìm kiếm và tìm thấy ảnh khớp với query, dữ liệu sẽ được tự động gửi lên MongoDB.

## Cấu Trúc Backend

```
server/
├── server.ts          # Express server chính
├── mongoService.ts    # MongoDB connection và CRUD operations
├── models.ts          # Mongoose models (tuỳ chọn)
└── routes/            # (có thể thêm sau)
```

## Yêu Cầu

- Node.js 16+
- MongoDB (local hoặc cloud - MongoDB Atlas)
- npm hoặc yarn

## Bước 1: Cài Đặt Dependencies

```bash
npm install
```

Hoặc nếu bạn đã cài đặt:

```bash
npm install express cors dotenv mongodb
npm install --save-dev @types/express
```

## Bước 2: Cấu Hình MongoDB

### Option A: Sử Dụng MongoDB Cục Bộ (Local)

**Windows:**
```powershell
# Cài đặt MongoDB Community Edition
# Tải từ: https://www.mongodb.com/try/download/community

# Khởi động MongoDB service
net start MongoDB

# Kiểm tra kết nối
mongosh
```

**macOS:**
```bash
# Cài đặt qua Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Khởi động
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
# Cài đặt
sudo apt-get install -y mongodb

# Khởi động
sudo systemctl start mongod
```

### Option B: Sử Dụng MongoDB Atlas (Cloud - Được Khuyến Nghị)

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo tài khoản miễn phí
3. Tạo cluster
4. Lấy connection string
5. Cập nhật vào `.env` file

## Bước 3: Cấu Hình Environment Variables

Tạo file `.env` trong thư mục gốc dự án:

```env
# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_google_genai_api_key_here

# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=ai_image_finder
NODE_ENV=development
```

**Nếu sử dụng MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai_image_finder?retryWrites=true&w=majority
```

## Bước 4: Chạy Backend Server

Mở terminal mới và chạy:

```bash
npm run dev:server
```

Hoặc chạy trực tiếp:

```bash
node server.js
```

Bạn sẽ thấy output:
```
✓ MongoDB connected successfully

🚀 Server is running on http://localhost:5000
📊 API Documentation:
   - GET  /api/health                    (Health check)
   - POST /api/images                    (Save image)
   - GET  /api/images                    (Get all images)
   - GET  /api/images/:imageId           (Get image by ID)
   - GET  /api/images/search?q=          (Search images)
   - GET  /api/images/source/:source     (Get by source)
   - DELETE /api/images/:imageId         (Delete image)
   - PUT  /api/images/:imageId           (Update image)
   - GET  /api/statistics                (Get statistics)
```

## Bước 5: Chạy Frontend (Terminal Riêng)

Mở terminal khác:

```bash
npm run dev
```

## API Endpoints

### 1. **Health Check**
```
GET /api/health
```
Kiểm tra xem server có hoạt động không

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

### 2. **Lưu Ảnh Tìm Kiếm Được** ⭐ (Quan trọng nhất)
```
POST /api/images
```

**Request Body (MongoImage):**
```json
{
  "searchQuery": "con chó đang chơi",
  "imageId": "img_12345",
  "imageName": "dog_play.jpg",
  "imageUrl": "https://example.com/dog_play.jpg",
  "imageBase64": "data:image/jpeg;base64,...",
  "mimeType": "image/jpeg",
  "matchScore": 95,
  "matchReason": "Hình ảnh rõ ràng thể hiện một chú chó đang chơi",
  "source": "upload",
  "driveFileId": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image saved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    ...
  }
}
```

---

### 3. **Lấy Tất Cả Ảnh**
```
GET /api/images
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "searchQuery": "con chó đang chơi",
      "imageId": "img_12345",
      "imageName": "dog_play.jpg",
      "matchScore": 95,
      "matchReason": "...",
      "source": "upload",
      "createdAt": "2024-11-14T10:30:00Z",
      ...
    }
  ],
  "count": 1
}
```

---

### 4. **Lấy Ảnh Theo ID**
```
GET /api/images/:imageId
```

---

### 5. **Tìm Kiếm Ảnh Theo Query**
```
GET /api/images/search?q=con chó
```

**Response:**
```json
{
  "success": true,
  "query": "con chó",
  "data": [...],
  "count": 5
}
```

---

### 6. **Lấy Ảnh Theo Source**
```
GET /api/images/source/upload
GET /api/images/source/google-drive
```

---

### 7. **Xóa Ảnh**
```
DELETE /api/images/:imageId
```

---

### 8. **Cập Nhật Ảnh**
```
PUT /api/images/:imageId
```

---

### 9. **Lấy Thống Kê**
```
GET /api/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalImages": 42,
    "topQueries": [
      {
        "_id": "con chó",
        "count": 15,
        "avgScore": 87.5
      },
      {
        "_id": "con mèo",
        "count": 12,
        "avgScore": 82.1
      }
    ],
    "sourceBreakdown": [
      {
        "_id": "upload",
        "count": 30
      },
      {
        "_id": "google-drive",
        "count": 12
      }
    ],
    "averageMatchScore": 85.3
  }
}
```

---

## Cách Frontend Hoạt Động

Khi người dùng:

1. ✅ Upload ảnh hoặc load từ Google Drive
2. ✅ Nhập query tìm kiếm
3. ✅ Nhấn "Tìm Kiếm" hoặc nói voice command

**Quy trình:**
```
1. Frontend gọi Gemini AI → Phân tích ảnh
2. Gemini trả về score (0-100) & reason
3. Frontend tìm ảnh có score cao nhất
4. Frontend TỰ ĐỘNG gọi POST /api/images
   với dữ liệu MongoImage
5. Backend lưu vào MongoDB
6. Hiển thị kết quả cho người dùng
```

## MongoImage Interface

```typescript
export interface MongoImage {
  _id?: string;                      // MongoDB ObjectId (auto-generated)
  searchQuery: string;               // Câu tìm kiếm
  imageId: string;                   // ID của ảnh
  imageName: string;                 // Tên file ảnh
  imageUrl?: string;                 // URL ảnh (tuỳ chọn)
  imageBase64?: string;              // Base64 encoded image (tuỳ chọn)
  mimeType: string;                  // Ví dụ: "image/jpeg"
  matchScore: number;                // Score 0-100
  matchReason: string;               // Lý do điểm số
  source: 'google-drive' | 'upload'; // Nguồn ảnh
  driveFileId?: string;              // Google Drive File ID (nếu từ Drive)
  createdAt?: Date;                  // Thời gian tạo
  updatedAt?: Date;                  // Thời gian cập nhật
}
```

## Debugging

### Kiểm tra MongoDB kết nối
```bash
# Windows/macOS
mongosh

# Xem databases
show dbs

# Chọn database
use ai_image_finder

# Xem collections
show collections

# Query dữ liệu
db.search_results.find()
```

### Xem logs backend
Mở DevTools (F12) → Console tab → Xem logs từ API calls

### Nếu API không kết nối
1. Chắc chắn backend đang chạy (`npm run dev:server`)
2. Chắc chắn MongoDB đang chạy
3. Kiểm tra `VITE_API_URL` trong `.env`
4. Kiểm tra browser console để xem errors

## Deployment

### Deploy Backend (Heroku, Railway, Render, etc.)

**Environment Variables cần thiết:**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
PORT=5000
DATABASE_NAME=ai_image_finder
NODE_ENV=production
```

### Deploy Frontend (Vercel, Netlify, etc.)

**Environment Variables cần thiết:**
```
VITE_API_URL=https://your-backend-api.com/api
VITE_GEMINI_API_KEY=your_key
```

## Troubleshooting

| Vấn Đề | Giải Pháp |
|--------|----------|
| MongoDB connection refused | Kiểm tra MongoDB đang chạy |
| CORS error | Chắc chắn backend đang chạy trên đúng port |
| 404 API endpoint | Kiểm tra server.ts routes |
| Timeout error | Tăng timeout, kiểm tra MONGODB_URI |
| Data not saving | Kiểm tra MongoDB write permissions |

## Cập Nhật Future

- [ ] Thêm authentication (JWT)
- [ ] Rate limiting
- [ ] Image compression trước lưu
- [ ] Export results (CSV, JSON)
- [ ] Batch operations
- [ ] Advanced search filters

---

**Liên hệ:** dinhhuy-project@github.com

**Happy searching! 🚀**
