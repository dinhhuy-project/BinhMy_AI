# 🚀 Railway Deployment Files

Những file này đã được tạo để giúp bạn deploy ứng dụng lên Railway một cách dễ dàng.

## 📁 File Configuration

### 1. **railway.json** & **railway.toml**
- Cấu hình chính cho Railway
- Chỉ định start command: `npm run start`
- Cấu hình build process

### 2. **Procfile**
- File đặc tả cho web dyno
- Railway sẽ đọc file này để biết cách start ứng dụng

### 3. **package.json** (Updated)
- Thêm script `start`: build frontend + run backend server
- Thêm script `build:server`: prepare server
- Server sẽ serve cả frontend (từ dist) và backend API

## 📖 Documentation

### 1. **RAILWAY_DEPLOYMENT.md**
Hướng dẫn chi tiết từng bước:
- Chuẩn bị tài khoản Railway
- Chuẩn bị MongoDB
- Chuẩn bị Google API key
- Deploy lên Railway
- Cấu hình environment variables
- Troubleshooting

**👉 Bắt đầu tại đây!**

### 2. **DEPLOYMENT_CHECKLIST.md**
Danh sách kiểm tra trước/sau deploy:
- Pre-deployment verification
- Git repository preparation
- External services setup
- Environment variables configuration
- Deployment monitoring
- Testing

**👉 Sử dụng để verify tất cả đã sẵn sàng**

## 🔧 Setup Scripts

### Windows
```powershell
# Chạy PowerShell script
.\setup-railway.ps1
```

### Linux/Mac
```bash
# Chạy bash script
chmod +x setup-railway.sh
./setup-railway.sh
```

### hoặc Node.js (Cross-platform)
```bash
node setup-railway.js
```

**Những script này sẽ:**
1. ✅ Kiểm tra Node.js và npm
2. ✅ Cài dependencies
3. ✅ Tạo .env file (từ .env.example)
4. ✅ Build frontend
5. ✅ Hướng dẫn bước tiếp theo

## 🎯 Quick Start

### 1. Chuẩn bị
```bash
# Chỉ chạy 1 lần - script sẽ setup tất cả
.\setup-railway.ps1  # Windows
./setup-railway.sh   # Linux/Mac
```

### 2. Cấu hình
Edit file `.env`:
```env
VITE_GEMINI_API_KEY=your_api_key
MONGODB_URI=your_mongodb_connection
```

### 3. Test Locally (Optional)
```bash
npm start
# Truy cập http://localhost:3001
```

### 4. Push to GitHub
```bash
git add .
git commit -m "Setup for Railway deployment"
git push origin main
```

### 5. Deploy trên Railway
1. Truy cập https://railway.app
2. Tạo project từ GitHub repo
3. Thêm environment variables
4. Xem logs - Railway sẽ tự động build & deploy

## 🔑 Key Changes

### server.js
- Thêm `path` import để serve static files
- Thêm `express.static()` middleware để serve frontend từ `dist` folder
- Thêm SPA fallback handler
- Frontend & Backend chạy trên cùng port

### package.json
```json
"start": "npm run build && node server.js"
```
- Một lệnh duy nhất build frontend + start server
- Perfect cho Railway environment

## 🚨 Important Notes

### Trước khi Deploy
- ✅ Đảm bảo `.env` được thêm vào `.gitignore`
- ✅ Không commit `.env` file
- ✅ Commit `.env.example` thay vào đó
- ✅ MongoDB Atlas account được setup
- ✅ Google Gemini API key có sẵn

### Environment Variables trên Railway
- Không cần `.env` file trên Railway
- Dùng Railway Dashboard để set variables
- Railway sẽ inject vào process environment

### Build Logs
- Kiểm tra Railway dashboard để xem build logs
- Nếu build fail, kiểm tra error message chi tiết

## ❓ FAQ

**Q: Railway tự động detect Node.js project không?**
A: Có, Railway tự detect qua package.json. Nhưng start command cần được chỉ định trong `Procfile` hoặc Railway config.

**Q: Mất bao lâu để deploy?**
A: Thường 2-5 phút cho lần đầu. Những lần tiếp theo nhanh hơn nhờ caching.

**Q: Có thể access logs không?**
A: Có, trong Railway dashboard, click vào project → Logs tab.

**Q: Frontend build có bao nhiêu dung lượng?**
A: Thường khoảng 100-300KB tùy dependencies. Nằm trong giới hạn free tier Railway.

**Q: Làm sao để update code sau khi deploy?**
A: Chỉ cần push lên GitHub, Railway sẽ tự động rebuild & redeploy.

## 📚 Tài Liệu Tham Khảo

- [Railway Docs](https://docs.railway.app/)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Express Static Files](https://expressjs.com/en/api/express.static.html)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)

---

**Bạn đã sẵn sàng deploy! 🎉**

Nếu có câu hỏi, xem chi tiết tại `RAILWAY_DEPLOYMENT.md`
