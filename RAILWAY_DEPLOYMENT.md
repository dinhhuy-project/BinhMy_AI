# 🚀 Hướng Dẫn Deploy trên Railway

## Bước 1: Chuẩn Bị Trước Deploy

### 1.1 Tạo tài khoản Railway
- Truy cập [railway.app](https://railway.app)
- Đăng ký hoặc đăng nhập bằng GitHub

### 1.2 Chuẩn Bị MongoDB
Railway hỗ trợ MongoDB. Bạn có 2 lựa chọn:
- **Option A**: Sử dụng MongoDB Atlas (khuyến nghị)
  - Tạo tài khoản tại [mongodb.com/cloud](https://www.mongodb.com/cloud)
  - Tạo một cluster miễn phí
  - Lấy connection string (MONGODB_URI)
  
- **Option B**: Sử dụng MongoDB trên Railway
  - Railway sẽ cung cấp MongoDB service

### 1.3 Chuẩn Bị Google Gemini API Key
- Truy cập [Google AI Studio](https://aistudio.google.com)
- Tạo API key mới
- Sao chép giá trị API key

## Bước 2: Deploy lên Railway

### 2.1 Kết nối Repository
```bash
# Nếu chưa có git repository, tạo mới
git init
git add .
git commit -m "Initial commit for Railway deployment"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2.2 Tạo Project trên Railway
1. Truy cập [railway.app/dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Kết nối GitHub account và chọn repository
4. Railway sẽ tự động detect project và deploy

### 2.3 Cấu Hình Environment Variables
Trong Railway dashboard:

1. **Frontend Variables**:
   ```
   VITE_GEMINI_API_KEY = your_api_key_here
   NODE_ENV = production
   ```

2. **Backend Variables**:
   ```
   PORT = ${{ PORT }}  (Railway tự động cung cấp)
   MONGODB_URI = your_mongodb_atlas_connection_string
   DATABASE_NAME = ai_image_finder
   NODE_ENV = production
   VITE_API_URL = https://your-railway-app.up.railway.app/api
   ```

## Bước 3: Xác Minh Deploy

### 3.1 Kiểm tra Build Logs
- Trong Railway dashboard, click vào project
- Xem tab "Logs" để kiểm tra quá trình build
- Đợi đến khi thấy "Deployment successful"

### 3.2 Truy cập Ứng Dụng
- URL sẽ như: `https://your-project-name.up.railway.app`
- Click vào link để kiểm tra ứng dụng

### 3.3 Kiểm tra Backend
```bash
# Kiểm tra API health check
curl https://your-project-name.up.railway.app/api/health
```

## Bước 4: Troubleshooting

### Lỗi Build
- Kiểm tra file `package.json` có các script cần thiết không
- Xem logs trong Railway dashboard để tìm lỗi chi tiết

### Lỗi Kết Nối MongoDB
- Kiểm tra MONGODB_URI trong Railway variables
- Đảm bảo IP của Railway được thêm vào MongoDB Atlas whitelist (hoặc set 0.0.0.0/0)

### Lỗi CORS
- Kiểm tra file `server.js` có CORS middleware được cấu hình đúng
- Đảm bảo `VITE_API_URL` trỏ đến đúng domain

### Frontend không load
- Kiểm tra build output: `npm run build`
- Đảm bảo frontend được build thành các file tĩnh

## Bước 5: Cập Nhật Sau Deploy

Để cập nhật code sau khi đã deploy:

```bash
git add .
git commit -m "Update: [description of changes]"
git push origin main
```

Railway sẽ tự động rebuild và redeploy ứng dụng của bạn!

## File Cấu Hình Đã Tạo

- ✅ `railway.json` - Cấu hình Railway
- ✅ `railway.toml` - Cấu hình thay thế (TOML format)
- ✅ `Procfile` - Cấu hình Procfile cho Railway
- ✅ `package.json` - Cập nhật scripts cho production

## Tài Liệu Tham Khảo

- [Railway Docs](https://docs.railway.app/)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Railway Deployment Guide](https://docs.railway.app/deploy/deploying-an-app)

---

**Lưu ý**: Đảm bảo không commit file `.env` - chỉ commit `.env.example`!
