# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy AI Image Finder trong 5 phút!

## ⚡ Chạy Nhanh (1 Lệnh - Windows)

**Mở PowerShell/CMD vào thư mục dự án và chạy:**

```powershell
.\start.bat
```

Hoặc thủ công:

```powershell
# Terminal 1
npm run dev:server

# Terminal 2 (cửa sổ khác)
npm run dev
```

## ⚡ Chạy Nhanh (macOS/Linux)

```bash
chmod +x start.sh
./start.sh
```

Hoặc thủ công:

```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev
```

## ✅ Điều Kiện Tiên Quyết

Trước tiên, hãy chuẩn bị:

1. **Node.js 16+** - [Download](https://nodejs.org)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
3. **Gemini API Key** - [Lấy tại đây](https://aistudio.google.com)

## 📋 Cấu Hình

### 1️⃣ Copy `.env.example` → `.env`

**Windows:**
```powershell
Copy-Item .env.example -Destination .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

### 2️⃣ Chỉnh sửa `.env`:

```env
# Thêm API key của bạn
VITE_GEMINI_API_KEY=sk-...your-key-here...

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=ai_image_finder

# Backend
PORT=5000
```

**Nếu dùng MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/ai_image_finder
```

### 3️⃣ Cài đặt Dependencies

```bash
npm install
```

## 🎯 Chạy Ứng Dụng

### Bước 1: Khởi động MongoDB

**Windows (CMD - Chạy as Administrator):**
```cmd
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**MongoDB Atlas (Cloud):**
Không cần khởi động - chỉ cần `MONGODB_URI` đúng

### Bước 2: Chạy Backend

```bash
npm run dev:server
```

Khi thấy:
```
✓ MongoDB connected successfully
🚀 Server is running on http://localhost:5000
```

✅ Backend sẵn sàng!

### Bước 3: Chạy Frontend (Terminal Khác)

```bash
npm run dev
```

Khi thấy:
```
VITE v6.2.0  ready in XXX ms
➜  Local:   http://localhost:5173/
```

✅ Frontend sẵn sàng!

### Bước 4: Mở Browser

Truy cập: **http://localhost:5173**

## 🧪 Test API

Khi backend đang chạy, thử API endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Xem tất cả kết quả
curl http://localhost:5000/api/search-results

# Xem thống kê
curl http://localhost:5000/api/statistics
```

**Hoặc dùng Postman:**
1. Import `API_EXAMPLES.js` 
2. Test các endpoints

## 📱 Sử Dụng Ứng Dụng

1. **Upload Ảnh:**
   - Click "Chọn Ảnh" để upload từ máy tính
   - Hoặc click "Load từ Google Drive" (cần authorize)

2. **Tìm Kiếm:**
   - Nhập văn bản hoặc nói lệnh (🎤 button)
   - Click "Tìm Kiếm" 

3. **Xem Kết Quả:**
   - Kết quả tốt nhất hiển thị
   - Dữ liệu tự động lưu lên MongoDB
   - Click ảnh để xem fullscreen

## 🔗 Endpoints Chính

| Method | Endpoint | Mục Đích |
|--------|----------|---------|
| GET | `/api/health` | Kiểm tra server |
| POST | `/api/search-results` | Lưu kết quả |
| GET | `/api/search-results` | Lấy tất cả kết quả |
| GET | `/api/search-results/search?q=` | Tìm kiếm |
| GET | `/api/statistics` | Xem thống kê |

## 🐛 Troubleshooting

### ❌ "MongoDB connection refused"
```
✓ Giải pháp: Chắc chắn MongoDB đang chạy
net start MongoDB   # Windows
brew services start mongodb-community  # macOS
```

### ❌ "CORS error"
```
✓ Giải pháp: Backend phải chạy trên port 5000
Kiểm tra VITE_API_URL=http://localhost:5000/api
```

### ❌ "API endpoint not found"
```
✓ Giải pháp: Chắc chắn backend đang chạy
npm run dev:server
```

### ❌ "Cannot find module"
```
✓ Giải pháp: Cài đặt lại dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Tài Liệu Chi Tiết

- 🔐 [MongoDB Setup](./MONGODB_API_SETUP.md)
- 🔑 [Google Drive Setup](./GOOGLE_DRIVE_SETUP.md)
- 📖 [API Documentation](./API_EXAMPLES.js)
- 🏗️ [Architecture](./README.md)

## 🎮 Features

✅ Tìm kiếm ảnh với Gemini AI  
✅ Voice search (🎤)  
✅ Google Drive integration  
✅ MongoDB auto-save  
✅ Statistics dashboard  
✅ Fullscreen viewer  

## 📞 Support

Gặp vấn đề? Kiểm tra:
1. MongoDB đang chạy
2. API key chính xác
3. Ports 5000 & 5173 rảnh
4. .env file đầy đủ

Liên hệ: dinhhuy-project@github.com

---

**Happy Searching! 🎉**

*Mất < 5 phút để chạy được!*
