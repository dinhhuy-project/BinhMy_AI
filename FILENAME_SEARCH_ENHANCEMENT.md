# 📄 Tăng Cường Khả Năng Tìm Kiếm Bằng Tên File

## 📋 Mô Tả

Đã triển khai tính năng cho phép AI đọc và phân tích **tên file của ảnh** cùng với nội dung trực quan để tăng độ chính xác của kết quả tìm kiếm.

## 🔄 Các Thay Đổi Thực Hiện

### 1. **Frontend - Lưu Trữ Tên File**

#### 📄 `types.ts`
- ✅ Thêm trường `filename?: string` vào interface `ImageFile`
- ✅ Thêm trường `imageFilename?: string` vào interface `MongoImage`
- Mục đích: Lưu trữ tên file gốc để AI có thể sử dụng

#### 🖼️ `components/ImageUploader.tsx`
- ✅ Gán `filename: file.name` khi tạo `ImageFile` từ upload
- Khi người dùng upload ảnh, tên file sẽ được lưu lại

#### 🗂️ `components/DriveImageLoader.tsx`
- ✅ Gán `filename: driveImage.name` khi tạo `ImageFile` từ Google Drive
- ✅ Gán `filename: img.name` khi khôi phục từ cache
- Khi lấy ảnh từ Google Drive, tên file sẽ được lưu lại

### 2. **AI Service - Sử Dụng Tên File Trong Phân Tích**

#### 🤖 `services/geminiService.ts`
- ✅ Cập nhật `rateBatchImageMatch()` để sử dụng tên file
- ✅ Prompt mới bao gồm:
  - Tên file của ảnh
  - Nội dung trực quan của ảnh (hình ảnh)
  - Yêu cầu tìm kiếm

**Prompt mới:**
```
Phân tích hình ảnh có tên file: "{filename}" và kiểm tra xem nó khớp với mô tả: "{query}" ở mức độ nào?

Hãy xem xét:
1. Tên file của ảnh - nó có chứa từ khóa liên quan đến mô tả không?
2. Nội dung trực quan của ảnh - nó có phù hợp với yêu cầu không?
3. Kết hợp cả hai yếu tố trên để đưa ra điểm số chính xác nhất.
```

### 3. **API Frontend - Lưu Filename**

#### 📨 `services/apiService.ts`
- ✅ `saveImageToMongoDB()` gửi `imageFilename` lên backend

#### 📱 `App.tsx`
- ✅ Gán `imageFilename: topMatch.image.filename || topMatch.image.file.name`
- Đảm bảo filename được lưu khi ghi kết quả vào MongoDB

### 4. **Backend API - Xử Lý Dữ Liệu Filename**

#### 🔌 `server/server.ts`
- ✅ Thêm endpoint `POST /api/images` - Lưu ảnh
- ✅ Thêm endpoint `GET /api/images` - Lấy tất cả ảnh
- ✅ Thêm endpoint `GET /api/images/search` - Tìm kiếm ảnh
- ✅ Thêm endpoint `GET /api/images/:id` - Lấy ảnh theo ID
- ✅ Thêm endpoint `GET /api/images/source/:source` - Lấy ảnh theo nguồn
- ✅ Thêm endpoint `DELETE /api/images/:id` - Xóa ảnh
- ✅ Lưu `imageFilename` vào `metadata.imageFilename`

## 🎯 Lợi Ích

### ✨ Độ Chính Xác Tăng
- AI không chỉ xem hình ảnh mà còn đọc tên file
- Ví dụ: Nếu tìm "chó", ảnh với tên "my_dog_photo.jpg" sẽ có điểm cao hơn

### 🔍 Tìm Kiếm Thông Minh Hơn
- Tên file có thể chứa từ khóa quan trọng
- Kết hợp từ khóa trong tên file + nội dung ảnh = kết quả tốt hơn

### 📊 Dữ Liệu Đầy Đủ
- Lưu filename trong MongoDB để có thể tìm kiếm/phân tích sau

## 🚀 Cách Sử Dụng

### Từ Phía Người Dùng - Không Thay Đổi
1. Upload ảnh hoặc chọn từ Google Drive
2. Nhập mô tả tìm kiếm
3. Kết quả sẽ chính xác hơn vì AI xem xét cả tên file

### Từ Phía Developer
Khi tạo `ImageFile`, hãy đảm bảo `filename` được gán:

```typescript
const imageFile: ImageFile = {
  id: 'unique-id',
  file: fileObject,
  base64: 'data:image/...',
  filename: fileObject.name, // ✅ Quan trọng
};
```

## 📋 Danh Sách API Endpoint

### Image Management
- `POST /api/images` - Lưu ảnh mới
- `GET /api/images` - Lấy tất cả ảnh
- `GET /api/images/search?q=query` - Tìm kiếm ảnh theo query
- `GET /api/images/:id` - Lấy ảnh theo ID
- `GET /api/images/source/:source` - Lấy ảnh theo source (google-drive/upload)
- `DELETE /api/images/:id` - Xóa ảnh

### Legacy Endpoints (vẫn hoạt động)
- `POST /api/search-results`
- `GET /api/search-results`
- `GET /api/search-results/search`

## ✅ Kiểm Tra

1. **Upload Ảnh:** Tên file được lưu
2. **Google Drive:** Tên file từ Drive được lưu
3. **Phân Tích:** AI xem xét tên file + nội dung
4. **MongoDB:** Lưu `imageFilename` trong metadata

## 📝 Lưu Ý

- Tên file phải có ý nghĩa để AI có thể phân tích tốt
- Ví dụ tốt: `dog_running.jpg`, `sunset_landscape.png`
- Ví dụ không tốt: `IMG_001.jpg`, `photo123.jpg`

---

**Ngày Triển Khai:** 21/11/2025  
**Phiên Bản:** v1.0
