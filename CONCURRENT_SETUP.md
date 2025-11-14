## 🚀 Setup Chạy Cùng Lúc Server + Client

Hệ thống đã được setup để chạy **cả backend (Express) và frontend (Vite)** cùng lúc trên port 3000.

### 📋 Cấu Hình Hiện Tại

```
Port 3000: Frontend (Vite React)
Port 3001: Backend (Express API)
```

### ✅ Cách Chạy

#### **Cách 1: Dùng Command (Nhanh nhất)**
```bash
npm run dev:all
```

#### **Cách 2: Dùng Script Batch (Windows)**
```bash
./dev.bat
```
hoặc double-click file `dev.bat`

#### **Cách 3: Dùng Script Shell (macOS/Linux)**
```bash
./dev.sh
```

#### **Cách 4: Chạy Riêng Lẻ (Nếu cần debug)**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

### 🌐 Truy Cập Ứng Dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

### 📁 Các File Được Cập Nhật

✅ `package.json`
- Thêm script: `dev:all`
- Thêm dependency: `concurrently`
- Backend port: 3001

✅ `server.js`
- Thay đổi PORT từ `5000` thành `3001`

✅ `.env`
- Cập nhật: `VITE_API_URL=http://localhost:3001/api`
- Thêm: `PORT=3001`

✅ `vite.config.ts`
- Frontend port: `3000` (không thay đổi)

✅ `dev.bat` (Windows launcher)
✅ `dev.sh` (Unix launcher)

### 🔧 Cấu Hình Environment

Nếu muốn thay đổi port, chỉnh sửa file `.env`:

```env
# Backend API port
PORT=3001

# Frontend sẽ tự động truy cập backend
VITE_API_URL=http://localhost:3001/api
```

### ⚠️ Lưu Ý

1. **Port 3000 & 3001 phải sẵn sàng** (không có app khác chạy trên port này)
2. **MongoDB phải đang chạy** (local hoặc cloud connection)
3. **Cần cài đặt `concurrently`** (đã cài rồi ✓)

### 🐛 Troubleshooting

**Lỗi: "Port 3000 is already in use"**
```bash
# Windows: Tìm process chạy trên port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

**Lỗi: "Port 3001 is already in use"**
```bash
# Windows
netstat -ano | findstr :3001

# Linux/macOS
lsof -i :3001
```

**Lỗi: Backend không respond**
- Kiểm tra `.env` có `VITE_API_URL=http://localhost:3001/api`
- Kiểm tra `server.js` chạy thành công
- Mở http://localhost:3001/api/health để test

### ✨ Lợi Ích Setup Này

✅ Chỉ cần 1 command để start toàn bộ app
✅ Frontend và backend chạy đồng thời
✅ Dễ debug vì thấy log của cả 2
✅ Tự động reload khi code thay đổi (Vite hot reload)
✅ Express server log cũng hiển thị

### 📊 Kết Quả Khi Chạy

```
$ npm run dev:all

> concurrently npm run dev:server npm run dev
> [0] node server.js
> [1] vite
> [0] ✓ MongoDB connected successfully
> [0] 🚀 Server running on http://localhost:3001
> [1] VITE v6.2.0  ready in 245 ms
> [1] ➜  Local:   http://localhost:3000/
> [1] ➜  press h to show help
```

Xong! Bạn có thể truy cập http://localhost:3000 ngay lập tức! 🎉

---

**Created**: November 14, 2025
**Status**: ✅ Production Ready
