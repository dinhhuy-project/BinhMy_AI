<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎯 Trình Tìm Kiếm Ảnh Thông Minh - AI Image Finder

Ứng dụng web thông minh sử dụng Gemini AI để tìm kiếm ảnh từ Google Drive. Kết quả tìm kiếm được tự động lưu lên MongoDB.

## ✨ Tính Năng

- 🔍 Tìm kiếm ảnh bằng văn bản với Gemini AI
- 🎤 Hỗ trợ tìm kiếm bằng giọng nói (Voice Search)
- 📁 Load ảnh từ Google Drive
- 📤 Upload ảnh từ máy tính
- 💾 Tự động lưu kết quả lên MongoDB
- 📊 Xem thống kê tìm kiếm
- 🖼️ Fullscreen image viewer

## 🚀 Cài Đặt Nhanh

### Prerequisites
- Node.js 16+
- MongoDB (local hoặc MongoDB Atlas)
- Google Gemini API Key
- Google OAuth credentials (tuỳ chọn)

### Bước 1: Clone và cài dependencies
```bash
git clone <repo-url>
cd BinhMy_AI
npm install
```

### Bước 2: Cấu hình Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Sau đó cập nhật các giá trị:

```env
# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_google_genai_api_key

# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=ai_image_finder
NODE_ENV=development
```

### Bước 3: Khởi Động Services

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend Development:**
```bash
npm run dev
```

Truy cập ứng dụng tại: `http://localhost:5173`

## 📡 API Documentation

Backend API cung cấp các endpoint để quản lý kết quả tìm kiếm:

### Health Check
```
GET /api/health
```

### Lưu Kết Quả Tìm Kiếm
```
POST /api/search-results
```

**Request Body:**
```json
{
  "query": "con chó đang chơi",
  "imageFileName": "dog_play.jpg",
  "matchScore": 95,
  "matchReason": "Hình ảnh thể hiện một chú chó đang chơi",
  "imageMimeType": "image/jpeg",
  "metadata": { "totalImagesScanned": 50 }
}
```

### Lấy Tất Cả Kết Quả
```
GET /api/search-results
```

### Tìm Kiếm Theo Query
```
GET /api/search-results/search?q=con chó
```

### Xem Thống Kê
```
GET /api/statistics
```

## 📂 Project Structure

```
BinhMy_AI/
├── components/              # React components
│   ├── DriveImageLoader.tsx
│   ├── ImageUploader.tsx
│   ├── SearchBar.tsx
│   ├── ResultDisplay.tsx
│   └── FullscreenViewer.tsx
├── services/               # API & services
│   ├── geminiService.ts    # Gemini AI integration
│   ├── driveService.ts     # Google Drive integration
│   └── apiService.ts       # Backend API client
├── hooks/                  # React hooks
│   └── useSpeechRecognition.ts
├── server/                 # Backend code
│   ├── server.js          # Express server
│   └── mongoService.ts    # MongoDB operations
├── App.tsx                # Main app component
├── index.tsx              # React entry point
├── tsconfig.json          # TypeScript config
└── vite.config.ts         # Vite config
```

## 🔧 Configuration

### Google Gemini API
1. Truy cập [Google AI Studio](https://aistudio.google.com)
2. Tạo API key
3. Thêm vào `.env` file

### MongoDB
**Local:**
- Windows: Cài đặt MongoDB Community Edition
- macOS: `brew install mongodb-community`
- Linux: `apt-get install mongodb`

**Cloud (Recommended):**
- Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Tạo cluster miễn phí
- Lấy connection string

### Google Drive (tuỳ chọn)
Xem `GOOGLE_DRIVE_SETUP.md` để hướng dẫn chi tiết

## 🛠️ Build & Deploy

### Build Frontend
```bash
npm run build
```
Output: `dist/` folder

### Build Backend
```bash
# Backend chạy trực tiếp không cần build
# Hoặc nếu muốn compile TypeScript:
npx tsc -p tsconfig.server.json
```

### Deploy to Vercel (Frontend)
```bash
vercel deploy
```

### Deploy to Heroku (Backend)
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## 📚 Hướng Dẫn Chi Tiết

- [MongoDB & API Setup](./MONGODB_API_SETUP.md)
- [Google Drive Integration](./GOOGLE_DRIVE_SETUP.md)
- [API Examples](./API_EXAMPLES.js)

## 🐛 Troubleshooting

| Vấn Đề | Giải Pháp |
|--------|----------|
| MongoDB connection refused | Kiểm tra MongoDB đang chạy |
| CORS error | Chắc chắn backend chạy trên port 5000 |
| API 404 | Kiểm tra URL trong `VITE_API_URL` |
| Gemini API error | Xác minh API key trong `.env` |

## 📝 License

MIT

## 👥 Contributors

- Bộ phận Đào tạo - Viện Công nghệ Blockchain và Trí tuệ nhân tạo ABAII

## 📧 Support

Liên hệ: dinhhuy-project@github.com

---

**Happy searching! 🎉**