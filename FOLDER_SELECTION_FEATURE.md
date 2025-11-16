# 📂 Tính Năng Chọn Thư Mục từ Google Drive

## Tổng Quát
Tính năng này cho phép người dùng lựa chọn thư mục con từ folder "BANG LED BEP" trên Google Drive và tải ảnh từ thư mục đã chọn.

## Các Tính Năng

### 1. ✓ Tìm Folder "BANG LED BEP"
- Tự động tìm folder có tên "BANG LED BEP" trong Google Drive
- Nếu không tìm thấy, hiển thị thông báo lỗi rõ ràng

### 2. ✓ Danh Sách Các Thư Mục Con
- Hiển thị dropdown danh sách tất cả thư mục con trong "BANG LED BEP"
- Danh sách được sắp xếp theo tên (A-Z)
- Tự động chọn thư mục đầu tiên làm mặc định

### 3. ✓ Chuyển Đổi Thư Mục
- Người dùng có thể chọn thư mục khác từ dropdown
- Khi thay đổi thư mục, kho ảnh sẽ tự động cập nhật
- Ảnh cũ sẽ bị xóa và tải ảnh mới từ thư mục đã chọn

### 4. ✓ Tải Lại Ảnh
- Nút "🔄 Tải lại ảnh" cho phép tải lại ảnh từ thư mục hiện tại
- Hữu ích khi muốn làm mới kho ảnh

### 5. ✓ Persistent Login
- Nếu người dùng đã đăng nhập trước đó, giao diện sẽ tự động:
  1. Khôi phục phiên làm việc từ cache
  2. Tải danh sách thư mục
  3. Tải ảnh từ thư mục mặc định (thư mục đầu tiên)

## Cấu Trúc Mã

### Services (`driveService.ts`)

#### Hàm Mới:
1. **`getAllSubfolders(parentFolderId)`**
   - Lấy danh sách tất cả thư mục con của một thư mục cha
   - Trả về: `Array<{id: string, name: string}>`

2. **`getImagesFromAnyFolder(folderId)`**
   - Lấy tất cả ảnh từ một thư mục bất kỳ
   - Tương tự `getImagesFromFolder()` nhưng có thể dùng cho bất kỳ folder nào
   - Trả về: `DriveImage[]`

#### Hàm Cũ (Giữ nguyên):
- `getScheduleFolderImages()` - Vẫn dùng cho tương thích ngược

### Component (`DriveImageLoader.tsx`)

#### State Mới:
```typescript
const [availableFolders, setAvailableFolders] = useState<FolderOption[]>([]);
const [selectedFolderId, setSelectedFolderId] = useState<string>('');
const [parentFolderId, setParentFolderId] = useState<string>('');
const [isLoadingFolders, setIsLoadingFolders] = useState(false);
```

#### Hàm Mới:
1. **`loadFolderList()`**
   - Gọi sau khi đăng nhập
   - Tìm folder "BANG LED BEP"
   - Tải danh sách thư mục con
   - Tự động tải ảnh từ thư mục đầu tiên

2. **`loadImagesFromSelectedFolder(folderId?)`**
   - Tải ảnh từ thư mục được chọn
   - Hỗ trợ cả việc nhập folderId trực tiếp hoặc lấy từ state

3. **`handleFolderChange(event)`**
   - Xử lý khi người dùng chọn thư mục mới từ dropdown
   - Xóa ảnh cũ
   - Tải ảnh mới từ thư mục đã chọn

#### UI Cập Nhật:
- Thêm dropdown `<select>` để chọn thư mục
- Cập nhật nút từ "📁 Tải ảnh từ Drive" thành "🔄 Tải lại ảnh"
- Hiển thị số lượng ảnh đã tải

## Quy Trình Sử Dụng

### Lần Đầu Tiên:
1. Người dùng nhấp "🔐 Đăng nhập Google"
2. Hệ thống tìm folder "BANG LED BEP"
3. Hiển thị dropdown với danh sách thư mục con
4. Tự động tải ảnh từ thư mục đầu tiên
5. Hiển thị ảnh trong kho ảnh

### Chuyển Đổi Thư Mục:
1. Người dùng chọn thư mục khác từ dropdown
2. Kho ảnh cũ bị xóa
3. Tự động tải ảnh từ thư mục mới
4. Hiển thị tiến độ tải

### Tải Lại Ảnh:
1. Người dùng nhấp nút "🔄 Tải lại ảnh"
2. Hệ thống tải lại ảnh từ thư mục hiện tại
3. Cập nhật kho ảnh

## Caching
- Các ảnh được tự động cache khi tải từ Google Drive
- Lần tải tiếp theo sẽ nhanh hơn (lấy từ cache nếu có)

## Xử Lý Lỗi
- Nếu không tìm thấy "BANG LED BEP": Hiển thị thông báo lỗi
- Nếu không có thư mục con: Hiển thị thông báo lỗi
- Nếu không có ảnh trong thư mục: Hiển thị thông báo "Không tìm thấy ảnh nào"
- Nếu tải ảnh thất bại: Hiển thị thông báo lỗi cụ thể

## Tương Thích
- Hoàn toàn tương thích với phiên bản cũ (persistent login)
- Không ảnh hưởng đến các tính năng khác
- Các hàm cũ vẫn hoạt động bình thường
