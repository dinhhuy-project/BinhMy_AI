## 📁 Cập Nhật: Lấy Ảnh Từ Folder "BANG LED BEP"

### ✅ Thay Đổi Được Thực Hiện

Ứng dụng hiện tại đã được cập nhật để tự động tìm và lấy ảnh từ folder **"BANG LED BEP"** trong Google Drive.

### 🔧 Các Thay Đổi Chi Tiết

#### 1. **services/driveService.ts**
```typescript
// Hàm mới: Tìm folder con đầu tiên
export const findFirstSubfolder = async (parentFolderId: string): Promise<string | null>

// Hàm chính được cập nhật
export const getScheduleFolderImages = async (): Promise<DriveImage[]>
  ✅ Bước 1: Tìm folder "BANG LED BEP"
  ✅ Bước 2: Tìm thư mục con đầu tiên bên trong nó
  ✅ Bước 3: Lấy tất cả ảnh từ thư mục con
```

#### 2. **components/DriveImageLoader.tsx**
```typescript
// Cập nhật message:
- Cũ: "Đang tìm thư mục 'Schedule'..."
- Mới: "Đang tìm thư mục 'BANG LED BEP'..."

// Cập nhật error message:
- Cũ: "Không tìm thấy ảnh nào trong thư mục 'Schedule'"
- Mới: "Không tìm thấy ảnh nào trong thư mục 'BANG LED BEP'"
```

### 📋 Cách Hoạt Động

```
Google Drive
├── BANG LED BEP (← Tìm folder này)
│   ├── Subfolder 1 (← Lấy ảnh từ folder con đầu tiên)
│   │   ├── image1.jpg
│   │   ├── image2.png
│   │   └── image3.jpg
│   ├── Subfolder 2
│   └── Subfolder 3
└── Other Folder
```

### 🚀 Cách Sử Dụng

1. **Khi đăng nhập Google Drive:**
   - Ứng dụng sẽ tự động tìm folder "BANG LED BEP"
   - Tìm thư mục con đầu tiên bên trong nó
   - Tải tất cả ảnh từ thư mục con đó

2. **Nếu muốn thay đổi folder:**
   - Sửa file `services/driveService.ts`
   - Tìm line: `await findFolderByName('BANG LED BEP')`
   - Thay 'BANG LED BEP' bằng tên folder mới

3. **Nếu muốn lấy ảnh trực tiếp từ BANG LED BEP (không cần subfolder):**
   - Sửa file `services/driveService.ts`
   - Thay đoạn code:
   ```typescript
   // Cũ:
   const bangLedBepFolderId = await findFolderByName('BANG LED BEP');
   const firstSubfolderId = await findFirstSubfolder(bangLedBepFolderId);
   const images = await getImagesFromFolder(firstSubfolderId);
   
   // Mới (lấy trực tiếp):
   const bangLedBepFolderId = await findFolderByName('BANG LED BEP');
   const images = await getImagesFromFolder(bangLedBepFolderId);
   ```

### 🔍 Console Log

Khi chạy ứng dụng, bạn sẽ thấy:
```
Found BANG LED BEP folder: 1a2b3c4d5e6f...
Found first subfolder: subfolder_name
Using first subfolder: 2f3g4h5i6j7k...
Downloading image img_1 from Google Drive
Saving image img_1 to cache
```

### ⚠️ Lưu Ý

1. **Folder phải tồn tại:** Folder "BANG LED BEP" phải có trong Google Drive của bạn
2. **Phải có subfolder:** Ít nhất phải có 1 thư mục con bên trong "BANG LED BEP"
3. **Cấp quyền:** Ứng dụng cần quyền `drive.readonly` để đọc files
4. **Cache:** Ảnh sẽ được cache lần đầu tiên, lần sau tải nhanh hơn

### 📌 API Tham Khảo

```typescript
// Tìm folder theo tên
await findFolderByName('BANG LED BEP') → folder_id

// Tìm folder con đầu tiên
await findFirstSubfolder(folder_id) → subfolder_id

// Lấy ảnh từ folder
await getImagesFromFolder(folder_id) → DriveImage[]

// Tải ảnh dưới dạng Base64
await getImageAsBase64(file_id, mimeType) → base64_string

// Lấy ảnh từ BANG LED BEP
await getScheduleFolderImages() → DriveImage[]
```

### 🐛 Troubleshooting

**Lỗi: "Không tìm thấy thư mục 'BANG LED BEP'"**
- Kiểm tra tên folder có chính xác không (phân biệt hoa thường)
- Kiểm tra folder có trong Google Drive không
- Kiểm tra quyền truy cập

**Lỗi: "Không tìm thấy thư mục con nào"**
- Tạo ít nhất 1 thư mục con bên trong BANG LED BEP
- Hoặc sửa code để lấy trực tiếp từ BANG LED BEP

**Ảnh không tải:**
- Kiểm tra browser console (F12) xem có error gì
- Kiểm tra Google Drive permissions
- Thử lại (có thể bị rate limit)

---

**Created:** November 14, 2025
**Status:** ✅ Production Ready
**Updated By:** GitHub Copilot
