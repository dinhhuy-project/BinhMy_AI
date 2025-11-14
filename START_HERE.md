# 🎉 Railway Deployment - Getting Started Guide

## 👋 Welcome!

Bạn đã được setup toàn bộ để deploy ứng dụng lên Railway. Dưới đây là hướng dẫn từng bước.

---

## 📖 **Bắt Đầu - 3 Bước**

### **1️⃣ Đọc Hướng Dẫn Chính (5 phút)**
Mở file: **`RAILWAY_DEPLOYMENT.md`**
- Giải thích chi tiết từng bước
- Hướng dẫn chuẩn bị MongoDB
- Hướng dẫn chuẩn bị Google API

### **2️⃣ Chạy Setup Script (5 phút)**

Chọn một lệnh phù hợp với OS của bạn:

**Windows (PowerShell):**
```powershell
.\setup-railway.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x setup-railway.sh
./setup-railway.sh
```

**Any OS (Node.js):**
```bash
node setup-railway.js
```

**Script sẽ tự động:**
- ✅ Kiểm tra Node.js & npm
- ✅ Cài dependencies (npm install)
- ✅ Tạo .env file từ .env.example
- ✅ Build frontend (npm run build)

### **3️⃣ Deploy (15 phút)**
Làm theo hướng dẫn trong `RAILWAY_DEPLOYMENT.md`

---

## 📚 **Tài Liệu Chi Tiết**

### Đọc Tuần Tự:
1. **RAILWAY_DEPLOYMENT.md** ⭐ **CỦA BẠN CẦN ĐỌC**
   - Hướng dẫn chi tiết từng bước
   - Troubleshooting guide

2. **SETUP_COMPLETE.md**
   - Quick reference (5 bước)
   - Nếu muốn nhanh

3. **DEPLOYMENT_CHECKLIST.md**
   - Kiểm tra trước deploy
   - Kiểm tra sau deploy

### Tham Khảo:
- **SETUP_FILES_README.md** - Giải thích từng file
- **FILE_MANIFEST.md** - Tổng quan tất cả thay đổi
- **RAILWAY_READY.txt** - Tóm tắt nhanh

---

## ⚡ **Quick Reference**

### Setup Local (Lần Đầu)
```bash
# Chạy setup script
.\setup-railway.ps1  # Windows
./setup-railway.sh   # Linux/Mac

# Edit .env với credentials
# Mở file .env và thêm:
# VITE_GEMINI_API_KEY=...
# MONGODB_URI=...
```

### Test Locally
```bash
# Chạy app locally
npm start

# Mở browser
http://localhost:3001

# Kiểm tra API
curl http://localhost:3001/api/health
```

### Deploy
```bash
# Push code
git add .
git commit -m "Deploy to Railway"
git push origin main

# Vào Railway Dashboard
https://railway.app

# Tạo project từ GitHub
# Railway sẽ tự động deploy!
```

---

## 🔑 **Thông Tin Cần Chuẩn Bị**

### **1. Google Gemini API Key**
- Truy cập: https://aistudio.google.com
- Click "Get API Key"
- Copy key → Lưu lại

### **2. MongoDB Connection String**
- Truy cập: https://mongodb.com/cloud
- Tạo account → Cluster
- Lấy Connection String
- Dạng: `mongodb+srv://user:pass@cluster.mongodb.net/`

### **3. GitHub Repository**
- Code phải được push lên GitHub
- Railway sẽ deploy từ GitHub
- Nên sử dụng `main` branch

---

## ✅ **Checklist Trước Deploy**

```
☐ Node.js 16+ installed
☐ npm install hoàn tất
☐ .env file configured
  ☐ VITE_GEMINI_API_KEY set
  ☐ MONGODB_URI set
☐ npm run build thành công
☐ npm start test thành công
☐ Code pushed to GitHub
☐ Railway account created
☐ Ready to deploy!
```

---

## 📁 **File Structure**

```
project/
├── 📖 RAILWAY_DEPLOYMENT.md        ← Đọc trước
├── 📖 SETUP_COMPLETE.md            ← Quick start
├── 📖 DEPLOYMENT_CHECKLIST.md      ← Verify
├── 🔧 setup-railway.ps1            ← Run this
├── 🔧 setup-railway.sh             ← Or this
├── ⚙️  railway.json                ← Config
├── ⚙️  Procfile                    ← Config
├── 🔐 .env.example                 ← Copy to .env
└── 📦 package.json                 ← Updated
```

---

## 🆘 **Thường Gặp & Giải Pháp**

### ❌ Setup script không chạy?
```bash
# Windows: Đảm bảo PowerShell mở với quyền Admin
# Linux/Mac: Chạy: chmod +x setup-railway.sh

# Hoặc dùng Node.js (mọi OS)
node setup-railway.js
```

### ❌ npm install fail?
```bash
# Xóa node_modules và package-lock.json
rm -r node_modules package-lock.json

# Cài lại
npm install
```

### ❌ npm build fail?
```bash
# Kiểm tra Node version
node --version

# Cần Node 16+
# Nếu cần cập nhật: https://nodejs.org
```

### ❌ Sau deploy app không load?
- Kiểm tra Railway Logs
- Xem error message
- Kiểm tra environment variables
- Xem `RAILWAY_DEPLOYMENT.md` - Troubleshooting section

---

## 🚀 **Deployment Flow**

```
1. Run setup script
   ↓
2. Configure .env
   ↓
3. Test local (npm start)
   ↓
4. Push to GitHub
   ↓
5. Create Railway project
   ↓
6. Add environment variables
   ↓
7. Railway auto-deploys
   ↓
8. ✅ App live!
```

---

## 📞 **Next Steps**

**Ngay bây giờ:**
1. [ ] Đọc `RAILWAY_DEPLOYMENT.md`
2. [ ] Chạy setup script
3. [ ] Cấu hình .env

**Trong 30 phút:**
4. [ ] Test locally
5. [ ] Push to GitHub

**Trên Railway:**
6. [ ] Tạo project
7. [ ] Deploy!

---

## 🎓 **Học Thêm**

- [Railway Docs](https://docs.railway.app/) - Tài liệu chính
- [Express.js](https://expressjs.com/) - Backend framework
- [Vite](https://vitejs.dev/) - Frontend bundler
- [MongoDB](https://docs.mongodb.com/) - Database docs

---

## ✨ **Bạn Đã Sẵn Sàng!**

Tất cả đã được setup. Bạn chỉ cần:

1. ✅ Đọc hướng dẫn
2. ✅ Chạy script
3. ✅ Deploy

**Thành công!** 🎉

---

**Bất kỳ câu hỏi nào, xem `RAILWAY_DEPLOYMENT.md` hoặc liên hệ support.**
